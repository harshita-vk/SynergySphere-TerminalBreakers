-- SynergySphere Seed Data
-- Sample data for development and testing

-- Insert demo users (passwords are 'password123' hashed with bcrypt)
INSERT OR IGNORE INTO users (username, email, password_hash) VALUES 
  ('john_doe', 'john@synergysphere.demo', '$2b$10$rOQUDOXPHPAGqq2.fV7XO.pJeLP5g8zHbL5ziTrR2w3kZPiYnLW2C'),
  ('jane_smith', 'jane@synergysphere.demo', '$2b$10$rOQUDOXPHPAGqq2.fV7XO.pJeLP5g8zHbL5ziTrR2w3kZPiYnLW2C'),
  ('alex_wilson', 'alex@synergysphere.demo', '$2b$10$rOQUDOXPHPAGqq2.fV7XO.pJeLP5g8zHbL5ziTrR2w3kZPiYnLW2C'),
  ('demo_user', 'demo@synergysphere.demo', '$2b$10$rOQUDOXPHPAGqq2.fV7XO.pJeLP5g8zHbL5ziTrR2w3kZPiYnLW2C');

-- Insert sample projects
INSERT OR IGNORE INTO projects (name, description, project_code, team_leader_id) VALUES 
  ('Website Redesign', 'Complete redesign of company website with modern UI/UX', 'PROJ01', 1),
  ('Mobile App Development', 'Cross-platform mobile application for customer service', 'PROJ02', 2),
  ('Data Analytics Dashboard', 'Business intelligence dashboard for sales analytics', 'PROJ03', 1);

-- Insert project members
INSERT OR IGNORE INTO project_members (project_id, user_id, role) VALUES 
  (1, 1, 'leader'),
  (1, 2, 'member'),
  (1, 3, 'member'),
  (2, 2, 'leader'),
  (2, 4, 'member'),
  (3, 1, 'leader'),
  (3, 4, 'member');

-- Insert sample tasks
INSERT OR IGNORE INTO tasks (project_id, assigned_to, title, description, deadline, created_by) VALUES 
  (1, 2, 'Create wireframes', 'Design wireframes for all main pages', datetime('now', '+7 days'), 1),
  (1, 3, 'Setup development environment', 'Configure React development environment and tools', datetime('now', '+3 days'), 1),
  (1, 1, 'Define project requirements', 'Document all functional and technical requirements', datetime('now', '+5 days'), 1),
  (2, 4, 'Research mobile frameworks', 'Compare React Native vs Flutter vs Ionic', datetime('now', '+10 days'), 2),
  (2, 2, 'Create app architecture', 'Design the overall architecture and data flow', datetime('now', '+14 days'), 2),
  (3, 4, 'Data source analysis', 'Analyze available data sources and APIs', datetime('now', '+7 days'), 1),
  (3, 1, 'Dashboard mockups', 'Create visual mockups of dashboard screens', datetime('now', '+12 days'), 1);

-- Insert sample todo items
INSERT OR IGNORE INTO todos (user_id, title) VALUES 
  (1, 'Review quarterly reports'),
  (1, 'Schedule team meeting for next week'),
  (2, 'Complete UI design course'),
  (2, 'Update portfolio website'),
  (3, 'Learn React hooks'),
  (4, 'Finish database optimization task');

-- Insert sample calendar events
INSERT OR IGNORE INTO calendar_events (user_id, title, description, event_date) VALUES 
  (1, 'Project kickoff meeting', 'Initial meeting for website redesign project', datetime('now', '+2 days', '+09:00')),
  (1, 'Client presentation', 'Present project progress to stakeholders', datetime('now', '+7 days', '+14:00')),
  (2, 'Design review', 'Review wireframes and mockups with team', datetime('now', '+4 days', '+11:00')),
  (3, 'Code review session', 'Peer code review for recent commits', datetime('now', '+3 days', '+15:30')),
  (4, 'Sprint planning', 'Plan tasks for upcoming sprint', datetime('now', '+5 days', '+10:00'));

-- Insert sample notices
INSERT OR IGNORE INTO notices (project_id, author_id, title, content) VALUES 
  (1, 1, 'Project Timeline Update', 'The website redesign deadline has been moved to accommodate additional features. Please update your schedules accordingly.'),
  (1, 1, 'Design Guidelines Available', 'New brand guidelines are now available in the documents folder. Please review before starting design work.'),
  (2, 2, 'Weekly Standup Changes', 'Starting next week, our standup meetings will be moved to 9:30 AM every Monday, Wednesday, and Friday.'),
  (3, 1, 'Data Access Approved', 'We have received approval to access the sales database. Credentials will be shared privately.');

-- Insert sample chat messages
INSERT OR IGNORE INTO chat_messages (project_id, user_id, message) VALUES 
  (1, 1, 'Welcome everyone to the Website Redesign project! Looking forward to working together.'),
  (1, 2, 'Excited to be part of this project! When do we start with the wireframes?'),
  (1, 3, 'I have some ideas for the technical architecture. Should we schedule a meeting to discuss?'),
  (1, 1, 'Great! Let''s schedule that for tomorrow. Jane, you can start with wireframes after we finalize requirements.'),
  (2, 2, 'Mobile app project is officially starting! First task is to research the best framework for our needs.'),
  (2, 4, 'I''ll start comparing React Native and Flutter. Will have a report ready by end of week.'),
  (3, 1, 'Data analytics dashboard project initiated. Let''s identify all data sources first.'),
  (3, 4, 'I can help with database analysis. Have experience with similar projects.');

-- Insert sample notifications
INSERT OR IGNORE INTO notifications (user_id, type, title, message, related_id) VALUES 
  (2, 'task_assigned', 'New Task Assigned', 'You have been assigned to: Create wireframes', 1),
  (3, 'task_assigned', 'New Task Assigned', 'You have been assigned to: Setup development environment', 2),
  (1, 'task_deadline', 'Task Deadline Reminder', 'Task "Define project requirements" is due in 24 hours', 3),
  (4, 'event_reminder', 'Calendar Event Reminder', 'Sprint planning meeting is scheduled for tomorrow at 10:00 AM', 5),
  (2, 'project_notice', 'New Project Notice', 'New notice posted in Website Redesign project', 1);