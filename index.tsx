import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { serveStatic } from 'hono/cloudflare-workers'

type Bindings = {
  DB: D1Database;
}

const app = new Hono<{ Bindings: Bindings }>()

// Enable CORS for frontend-backend communication
app.use('/api/*', cors())

// Serve static files from public directory
app.use('/static/*', serveStatic({ root: './public' }))

// Utility function to generate project codes
function generateProjectCode(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase()
}

// Simple password hashing (for demo - use bcrypt in production)
async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(password)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

// Authentication APIs
app.post('/api/auth/signup', async (c) => {
  try {
    const { username, email, password } = await c.req.json()
    
    if (!username || !email || !password) {
      return c.json({ error: 'All fields are required' }, 400)
    }

    // Check if user already exists
    const existingUser = await c.env.DB.prepare(
      'SELECT id FROM users WHERE email = ? OR username = ?'
    ).bind(email, username).first()

    if (existingUser) {
      return c.json({ error: 'User with this email or username already exists' }, 409)
    }

    // Hash password and create user
    const passwordHash = await hashPassword(password)
    const result = await c.env.DB.prepare(
      'INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?) RETURNING id, username, email'
    ).bind(username, email, passwordHash).first()

    return c.json({ 
      success: true, 
      user: result,
      message: 'Account created successfully' 
    })
  } catch (error) {
    console.error('Signup error:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
})

app.post('/api/auth/login', async (c) => {
  try {
    const { email, password } = await c.req.json()
    
    if (!email || !password) {
      return c.json({ error: 'Email and password are required' }, 400)
    }

    // Find user and verify password
    const user = await c.env.DB.prepare(
      'SELECT id, username, email, password_hash FROM users WHERE email = ?'
    ).bind(email).first() as any

    if (!user) {
      return c.json({ error: 'Invalid email or password' }, 401)
    }

    const passwordHash = await hashPassword(password)
    if (passwordHash !== user.password_hash) {
      return c.json({ error: 'Invalid email or password' }, 401)
    }

    return c.json({ 
      success: true, 
      user: { id: user.id, username: user.username, email: user.email },
      message: 'Login successful' 
    })
  } catch (error) {
    console.error('Login error:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
})

// Project APIs
app.post('/api/projects/create', async (c) => {
  try {
    const { name, description, userId } = await c.req.json()
    
    if (!name || !userId) {
      return c.json({ error: 'Project name and user ID are required' }, 400)
    }

    // Generate unique project code
    let projectCode = generateProjectCode()
    let attempts = 0
    while (attempts < 10) {
      const existing = await c.env.DB.prepare(
        'SELECT id FROM projects WHERE project_code = ?'
      ).bind(projectCode).first()
      
      if (!existing) break
      projectCode = generateProjectCode()
      attempts++
    }

    // Create project
    const result = await c.env.DB.prepare(
      'INSERT INTO projects (name, description, project_code, team_leader_id) VALUES (?, ?, ?, ?) RETURNING *'
    ).bind(name, description || '', projectCode, userId).first()

    // Add creator as team leader in project_members
    await c.env.DB.prepare(
      'INSERT INTO project_members (project_id, user_id, role) VALUES (?, ?, ?)'
    ).bind(result.id, userId, 'leader').run()

    return c.json({ success: true, project: result })
  } catch (error) {
    console.error('Create project error:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
})

app.post('/api/projects/join', async (c) => {
  try {
    const { projectCode, userId } = await c.req.json()
    
    if (!projectCode || !userId) {
      return c.json({ error: 'Project code and user ID are required' }, 400)
    }

    // Find project by code
    const project = await c.env.DB.prepare(
      'SELECT * FROM projects WHERE project_code = ?'
    ).bind(projectCode.toUpperCase()).first()

    if (!project) {
      return c.json({ error: 'Invalid project code' }, 404)
    }

    // Check if user is already a member
    const existingMember = await c.env.DB.prepare(
      'SELECT id FROM project_members WHERE project_id = ? AND user_id = ?'
    ).bind(project.id, userId).first()

    if (existingMember) {
      return c.json({ error: 'You are already a member of this project' }, 409)
    }

    // Add user to project
    await c.env.DB.prepare(
      'INSERT INTO project_members (project_id, user_id, role) VALUES (?, ?, ?)'
    ).bind(project.id, userId, 'member').run()

    return c.json({ success: true, project })
  } catch (error) {
    console.error('Join project error:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
})

app.get('/api/projects/user/:userId', async (c) => {
  try {
    const userId = c.req.param('userId')
    
    const projects = await c.env.DB.prepare(`
      SELECT p.*, pm.role, u.username as leader_name
      FROM projects p
      JOIN project_members pm ON p.id = pm.project_id
      JOIN users u ON p.team_leader_id = u.id
      WHERE pm.user_id = ?
      ORDER BY p.created_at DESC
    `).bind(userId).all()

    return c.json({ success: true, projects: projects.results })
  } catch (error) {
    console.error('Get user projects error:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
})

app.get('/api/projects/:projectId', async (c) => {
  try {
    const projectId = c.req.param('projectId')
    
    // Get project details with leader info
    const project = await c.env.DB.prepare(`
      SELECT p.*, u.username as leader_name
      FROM projects p
      JOIN users u ON p.team_leader_id = u.id
      WHERE p.id = ?
    `).bind(projectId).first()

    if (!project) {
      return c.json({ error: 'Project not found' }, 404)
    }

    // Get project members
    const members = await c.env.DB.prepare(`
      SELECT u.id, u.username, u.email, pm.role, pm.joined_at
      FROM users u
      JOIN project_members pm ON u.id = pm.user_id
      WHERE pm.project_id = ?
      ORDER BY pm.role DESC, u.username
    `).bind(projectId).all()

    return c.json({ 
      success: true, 
      project: { 
        ...project, 
        members: members.results 
      } 
    })
  } catch (error) {
    console.error('Get project error:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
})

// Task APIs
app.get('/api/projects/:projectId/tasks', async (c) => {
  try {
    const projectId = c.req.param('projectId')
    
    const tasks = await c.env.DB.prepare(`
      SELECT t.*, u.username as assigned_to_name, creator.username as created_by_name
      FROM tasks t
      LEFT JOIN users u ON t.assigned_to = u.id
      JOIN users creator ON t.created_by = creator.id
      WHERE t.project_id = ?
      ORDER BY t.deadline ASC, t.created_at DESC
    `).bind(projectId).all()

    return c.json({ success: true, tasks: tasks.results })
  } catch (error) {
    console.error('Get tasks error:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
})

app.post('/api/tasks/create', async (c) => {
  try {
    const { projectId, assignedTo, title, description, deadline, createdBy } = await c.req.json()
    
    if (!projectId || !title || !createdBy) {
      return c.json({ error: 'Project ID, title, and creator are required' }, 400)
    }

    const result = await c.env.DB.prepare(
      'INSERT INTO tasks (project_id, assigned_to, title, description, deadline, created_by) VALUES (?, ?, ?, ?, ?, ?) RETURNING *'
    ).bind(projectId, assignedTo || null, title, description || '', deadline || null, createdBy).first()

    return c.json({ success: true, task: result })
  } catch (error) {
    console.error('Create task error:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
})

app.put('/api/tasks/:taskId/complete', async (c) => {
  try {
    const taskId = c.req.param('taskId')
    const { completed } = await c.req.json()
    
    await c.env.DB.prepare(
      'UPDATE tasks SET completed = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?'
    ).bind(completed, taskId).run()

    return c.json({ success: true })
  } catch (error) {
    console.error('Update task error:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
})

// Personal Todo APIs
app.get('/api/todos/:userId', async (c) => {
  try {
    const userId = c.req.param('userId')
    
    const todos = await c.env.DB.prepare(
      'SELECT * FROM todos WHERE user_id = ? ORDER BY created_at DESC'
    ).bind(userId).all()

    return c.json({ success: true, todos: todos.results })
  } catch (error) {
    console.error('Get todos error:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
})

app.post('/api/todos/create', async (c) => {
  try {
    const { userId, title } = await c.req.json()
    
    if (!userId || !title) {
      return c.json({ error: 'User ID and title are required' }, 400)
    }

    const result = await c.env.DB.prepare(
      'INSERT INTO todos (user_id, title) VALUES (?, ?) RETURNING *'
    ).bind(userId, title).first()

    return c.json({ success: true, todo: result })
  } catch (error) {
    console.error('Create todo error:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
})

app.put('/api/todos/:todoId/complete', async (c) => {
  try {
    const todoId = c.req.param('todoId')
    const { completed } = await c.req.json()
    
    await c.env.DB.prepare(
      'UPDATE todos SET completed = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?'
    ).bind(completed, todoId).run()

    return c.json({ success: true })
  } catch (error) {
    console.error('Update todo error:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
})

// Calendar APIs
app.get('/api/calendar/:userId', async (c) => {
  try {
    const userId = c.req.param('userId')
    
    const events = await c.env.DB.prepare(
      'SELECT * FROM calendar_events WHERE user_id = ? ORDER BY event_date ASC'
    ).bind(userId).all()

    return c.json({ success: true, events: events.results })
  } catch (error) {
    console.error('Get calendar events error:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
})

app.post('/api/calendar/create', async (c) => {
  try {
    const { userId, title, description, eventDate } = await c.req.json()
    
    if (!userId || !title || !eventDate) {
      return c.json({ error: 'User ID, title, and event date are required' }, 400)
    }

    const result = await c.env.DB.prepare(
      'INSERT INTO calendar_events (user_id, title, description, event_date) VALUES (?, ?, ?, ?) RETURNING *'
    ).bind(userId, title, description || '', eventDate).first()

    return c.json({ success: true, event: result })
  } catch (error) {
    console.error('Create calendar event error:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
})

// Notice board APIs
app.get('/api/projects/:projectId/notices', async (c) => {
  try {
    const projectId = c.req.param('projectId')
    
    const notices = await c.env.DB.prepare(`
      SELECT n.*, u.username as author_name
      FROM notices n
      JOIN users u ON n.author_id = u.id
      WHERE n.project_id = ?
      ORDER BY n.created_at DESC
    `).bind(projectId).all()

    return c.json({ success: true, notices: notices.results })
  } catch (error) {
    console.error('Get notices error:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
})

app.post('/api/notices/create', async (c) => {
  try {
    const { projectId, authorId, title, content } = await c.req.json()
    
    if (!projectId || !authorId || !title || !content) {
      return c.json({ error: 'All fields are required' }, 400)
    }

    const result = await c.env.DB.prepare(
      'INSERT INTO notices (project_id, author_id, title, content) VALUES (?, ?, ?, ?) RETURNING *'
    ).bind(projectId, authorId, title, content).first()

    return c.json({ success: true, notice: result })
  } catch (error) {
    console.error('Create notice error:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
})

// Chat APIs
app.get('/api/projects/:projectId/messages', async (c) => {
  try {
    const projectId = c.req.param('projectId')
    
    const messages = await c.env.DB.prepare(`
      SELECT m.*, u.username
      FROM chat_messages m
      JOIN users u ON m.user_id = u.id
      WHERE m.project_id = ?
      ORDER BY m.created_at ASC
    `).bind(projectId).all()

    return c.json({ success: true, messages: messages.results })
  } catch (error) {
    console.error('Get messages error:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
})

app.post('/api/messages/create', async (c) => {
  try {
    const { projectId, userId, message } = await c.req.json()
    
    if (!projectId || !userId || !message) {
      return c.json({ error: 'All fields are required' }, 400)
    }

    const result = await c.env.DB.prepare(
      'INSERT INTO chat_messages (project_id, user_id, message) VALUES (?, ?, ?) RETURNING *'
    ).bind(projectId, userId, message).first()

    return c.json({ success: true, message: result })
  } catch (error) {
    console.error('Create message error:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
})

// Main application route
app.get('/', (c) => {
  return c.html(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>SynergySphere - Team Collaboration Platform</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <script>
            tailwind.config = {
                theme: {
                    extend: {
                        colors: {
                            'pale-orange': {
                                50: '#fef7f0',
                                100: '#feede0',
                                200: '#fdd8c0',
                                300: '#fbb895',
                                400: '#f79168',
                                500: '#f37544',
                                600: '#e45e2e',
                                700: '#bd4a24',
                                800: '#973e21',
                                900: '#7b361f'
                            }
                        }
                    }
                }
            }
        </script>
        <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
        <link href="/static/styles.css" rel="stylesheet">
    </head>
    <body class="bg-gradient-to-br from-pale-orange-50 to-pale-orange-100 min-h-screen">
        <!-- Loading Screen -->
        <div id="loading-screen" class="fixed inset-0 bg-pale-orange-500 flex items-center justify-center z-50">
            <div class="text-center">
                <div class="animate-spin rounded-full h-32 w-32 border-b-2 border-white mb-4"></div>
                <h1 class="text-4xl font-bold text-white mb-2">SynergySphere</h1>
                <p class="text-pale-orange-100">Advanced Team Collaboration Platform</p>
            </div>
        </div>

        <!-- App Container -->
        <div id="app" class="hidden">
            <!-- Content will be dynamically loaded here -->
        </div>
        
        <script src="https://cdn.jsdelivr.net/npm/axios@1.6.0/dist/axios.min.js"></script>
        <script src="/static/app.js"></script>
    </body>
    </html>
  `)
})

export default app