// SynergySphere Frontend Application
class SynergyApp {
    constructor() {
        this.currentUser = null;
        this.currentProject = null;
        this.currentView = 'login';
        this.notifications = [];
        
        // Initialize app after DOM loads
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.init());
        } else {
            this.init();
        }
    }

    init() {
        // Check for existing session
        const savedUser = localStorage.getItem('synergyUser');
        if (savedUser) {
            this.currentUser = JSON.parse(savedUser);
            this.showDashboard();
        } else {
            this.showLogin();
        }
        
        // Hide loading screen
        setTimeout(() => {
            document.getElementById('loading-screen').classList.add('hidden');
            document.getElementById('app').classList.remove('hidden');
        }, 1500);
    }

    // Utility Functions
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <div class="flex items-center justify-between">
                <span>${message}</span>
                <button onclick="this.parentElement.parentElement.remove()" class="ml-4 text-white hover:text-gray-200">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;
        document.body.appendChild(notification);
        
        // Show notification
        setTimeout(() => notification.classList.add('show'), 100);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 5000);
    }

    async apiCall(endpoint, method = 'GET', data = null) {
        try {
            const config = {
                method,
                headers: {
                    'Content-Type': 'application/json',
                }
            };
            
            if (data) {
                config.body = JSON.stringify(data);
            }
            
            const response = await fetch(`/api${endpoint}`, config);
            const result = await response.json();
            
            if (!response.ok) {
                throw new Error(result.error || 'API request failed');
            }
            
            return result;
        } catch (error) {
            console.error('API Error:', error);
            this.showNotification(error.message, 'error');
            throw error;
        }
    }

    // Authentication Views
    showLogin() {
        this.currentView = 'login';
        const app = document.getElementById('app');
        app.innerHTML = `
            <div class="min-h-screen flex items-center justify-center p-4">
                <div class="max-w-md w-full glass-card rounded-2xl p-8 fade-in">
                    <div class="text-center mb-8">
                        <div class="w-20 h-20 bg-gradient-to-br from-pale-orange-400 to-pale-orange-600 rounded-full mx-auto mb-4 flex items-center justify-center">
                            <i class="fas fa-users text-white text-2xl"></i>
                        </div>
                        <h1 class="text-3xl font-bold text-pale-orange-800 mb-2">SynergySphere</h1>
                        <p class="text-pale-orange-600">Welcome back! Please sign in to continue.</p>
                    </div>
                    
                    <form id="loginForm" class="space-y-6">
                        <div>
                            <label class="block text-pale-orange-700 font-medium mb-2">Email</label>
                            <input type="email" id="loginEmail" required 
                                class="w-full form-input px-4 py-3 border border-pale-orange-200 rounded-lg focus:border-pale-orange-400 focus:outline-none bg-white/50" 
                                placeholder="Enter your email">
                        </div>
                        
                        <div>
                            <label class="block text-pale-orange-700 font-medium mb-2">Password</label>
                            <input type="password" id="loginPassword" required 
                                class="w-full form-input px-4 py-3 border border-pale-orange-200 rounded-lg focus:border-pale-orange-400 focus:outline-none bg-white/50" 
                                placeholder="Enter your password">
                        </div>
                        
                        <button type="submit" class="w-full btn-primary text-white font-medium py-3 rounded-lg">
                            <i class="fas fa-sign-in-alt mr-2"></i>Sign In
                        </button>
                    </form>
                    
                    <div class="mt-6 text-center">
                        <a href="#" onclick="app.showForgotPassword()" class="text-pale-orange-600 hover:text-pale-orange-800 text-sm">
                            Forgot your password?
                        </a>
                    </div>
                    
                    <div class="mt-8 text-center">
                        <p class="text-pale-orange-600 mb-4">Don't have an account with us?</p>
                        <button onclick="app.showSignup()" class="btn-secondary text-pale-orange-800 px-6 py-2 rounded-lg font-medium">
                            Sign up now!
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        document.getElementById('loginForm').addEventListener('submit', (e) => this.handleLogin(e));
    }

    showSignup() {
        this.currentView = 'signup';
        const app = document.getElementById('app');
        app.innerHTML = `
            <div class="min-h-screen flex items-center justify-center p-4">
                <div class="max-w-md w-full glass-card rounded-2xl p-8 fade-in">
                    <div class="text-center mb-8">
                        <div class="w-20 h-20 bg-gradient-to-br from-pale-orange-400 to-pale-orange-600 rounded-full mx-auto mb-4 flex items-center justify-center">
                            <i class="fas fa-user-plus text-white text-2xl"></i>
                        </div>
                        <h1 class="text-3xl font-bold text-pale-orange-800 mb-2">Join SynergySphere</h1>
                        <p class="text-pale-orange-600">Create your account to start collaborating.</p>
                    </div>
                    
                    <form id="signupForm" class="space-y-6">
                        <div>
                            <label class="block text-pale-orange-700 font-medium mb-2">Username</label>
                            <input type="text" id="signupUsername" required 
                                class="w-full form-input px-4 py-3 border border-pale-orange-200 rounded-lg focus:border-pale-orange-400 focus:outline-none bg-white/50" 
                                placeholder="Choose a username">
                        </div>
                        
                        <div>
                            <label class="block text-pale-orange-700 font-medium mb-2">Email</label>
                            <input type="email" id="signupEmail" required 
                                class="w-full form-input px-4 py-3 border border-pale-orange-200 rounded-lg focus:border-pale-orange-400 focus:outline-none bg-white/50" 
                                placeholder="Enter your email">
                        </div>
                        
                        <div>
                            <label class="block text-pale-orange-700 font-medium mb-2">Password</label>
                            <input type="password" id="signupPassword" required 
                                class="w-full form-input px-4 py-3 border border-pale-orange-200 rounded-lg focus:border-pale-orange-400 focus:outline-none bg-white/50" 
                                placeholder="Create a password">
                        </div>
                        
                        <div>
                            <label class="block text-pale-orange-700 font-medium mb-2">Confirm Password</label>
                            <input type="password" id="signupConfirmPassword" required 
                                class="w-full form-input px-4 py-3 border border-pale-orange-200 rounded-lg focus:border-pale-orange-400 focus:outline-none bg-white/50" 
                                placeholder="Confirm your password">
                        </div>
                        
                        <button type="submit" class="w-full btn-primary text-white font-medium py-3 rounded-lg">
                            <i class="fas fa-user-plus mr-2"></i>Sign Up
                        </button>
                    </form>
                    
                    <div class="mt-8 text-center">
                        <p class="text-pale-orange-600 mb-4">Already have an account?</p>
                        <button onclick="app.showLogin()" class="btn-secondary text-pale-orange-800 px-6 py-2 rounded-lg font-medium">
                            Sign in here
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        document.getElementById('signupForm').addEventListener('submit', (e) => this.handleSignup(e));
    }

    showForgotPassword() {
        this.showNotification('Forgot password functionality will be implemented in the next version.', 'info');
    }

    async handleLogin(e) {
        e.preventDefault();
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        
        try {
            const result = await this.apiCall('/auth/login', 'POST', { email, password });
            this.currentUser = result.user;
            localStorage.setItem('synergyUser', JSON.stringify(this.currentUser));
            this.showNotification(result.message, 'success');
            this.showDashboard();
        } catch (error) {
            console.error('Login failed:', error);
        }
    }

    async handleSignup(e) {
        e.preventDefault();
        const username = document.getElementById('signupUsername').value;
        const email = document.getElementById('signupEmail').value;
        const password = document.getElementById('signupPassword').value;
        const confirmPassword = document.getElementById('signupConfirmPassword').value;
        
        if (password !== confirmPassword) {
            this.showNotification('Passwords do not match!', 'error');
            return;
        }
        
        try {
            const result = await this.apiCall('/auth/signup', 'POST', { username, email, password });
            this.showNotification(result.message, 'success');
            this.showLogin();
        } catch (error) {
            console.error('Signup failed:', error);
        }
    }

    // Dashboard View
    showDashboard() {
        this.currentView = 'dashboard';
        const app = document.getElementById('app');
        app.innerHTML = `
            <!-- Mobile menu overlay -->
            <div id="mobileOverlay" class="mobile-overlay" onclick="app.toggleSidebar()"></div>
            
            <!-- Sidebar -->
            <div id="sidebar" class="sidebar fixed left-0 top-0 w-80 h-full bg-gradient-to-b from-pale-orange-500 to-pale-orange-600 text-white shadow-2xl z-40 slide-in-left">
                <!-- Profile Section -->
                <div class="p-6 border-b border-pale-orange-400">
                    <div class="flex items-center space-x-4 cursor-pointer" onclick="app.toggleProfileDropdown()">
                        <div class="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                            <i class="fas fa-user text-xl"></i>
                        </div>
                        <div class="flex-1">
                            <h3 class="font-semibold">${this.currentUser.username}</h3>
                            <p class="text-pale-orange-100 text-sm">${this.currentUser.email}</p>
                        </div>
                        <i class="fas fa-chevron-down"></i>
                    </div>
                    
                    <!-- Profile Dropdown -->
                    <div id="profileDropdown" class="hidden mt-4 bg-white/10 rounded-lg p-4 space-y-2">
                        <div class="text-sm">
                            <strong>Name:</strong> ${this.currentUser.username}
                        </div>
                        <div class="text-sm">
                            <strong>Email:</strong> ${this.currentUser.email}
                        </div>
                        <button onclick="app.logout()" class="w-full mt-3 bg-white/20 hover:bg-white/30 px-4 py-2 rounded text-sm">
                            <i class="fas fa-sign-out-alt mr-2"></i>Log Out
                        </button>
                    </div>
                </div>
                
                <!-- Navigation -->
                <nav class="flex-1 p-4">
                    <div class="space-y-2">
                        <a href="#" onclick="app.showMyCalendar()" class="sidebar-item flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-white/10">
                            <i class="fas fa-calendar-alt w-5"></i>
                            <span>My Calendar</span>
                        </a>
                        <a href="#" onclick="app.showTodoList()" class="sidebar-item flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-white/10">
                            <i class="fas fa-tasks w-5"></i>
                            <span>To-Do List</span>
                        </a>
                        <a href="#" onclick="app.showMyProjects()" class="sidebar-item flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-white/10">
                            <i class="fas fa-project-diagram w-5"></i>
                            <span>My Projects</span>
                        </a>
                    </div>
                </nav>
                
                <!-- Join/Create Project -->
                <div class="p-4 border-t border-pale-orange-400">
                    <button onclick="app.showProjectModal()" class="w-full btn-secondary text-pale-orange-800 py-3 rounded-lg font-medium hover:bg-white/20 hover:text-white">
                        <i class="fas fa-plus mr-2"></i>Join / Create Project
                    </button>
                </div>
            </div>
            
            <!-- Mobile menu button -->
            <button id="mobileMenuBtn" class="md:hidden fixed top-4 left-4 z-50 bg-pale-orange-500 text-white p-3 rounded-full shadow-lg" onclick="app.toggleSidebar()">
                <i class="fas fa-bars"></i>
            </button>
            
            <!-- Main Content -->
            <div id="mainContent" class="main-content ml-80 min-h-screen bg-gradient-to-br from-pale-orange-50 to-pale-orange-100 slide-in-right">
                <div id="contentArea" class="p-8">
                    <div class="text-center py-20">
                        <div class="w-32 h-32 bg-gradient-to-br from-pale-orange-400 to-pale-orange-600 rounded-full mx-auto mb-8 flex items-center justify-center">
                            <i class="fas fa-rocket text-white text-4xl"></i>
                        </div>
                        <h1 class="text-4xl font-bold text-pale-orange-800 mb-4">Welcome to SynergySphere</h1>
                        <p class="text-pale-orange-600 text-lg mb-8 max-w-2xl mx-auto">
                            Your advanced team collaboration platform. Select an option from the sidebar to get started 
                            with managing your projects, calendar, and tasks.
                        </p>
                        <div class="grid-responsive max-w-4xl mx-auto">
                            <div class="glass-card p-6 rounded-2xl text-center">
                                <i class="fas fa-calendar-alt text-pale-orange-500 text-3xl mb-4"></i>
                                <h3 class="font-bold text-pale-orange-800 mb-2">Smart Calendar</h3>
                                <p class="text-pale-orange-600 text-sm">Manage events and get timely reminders</p>
                            </div>
                            <div class="glass-card p-6 rounded-2xl text-center">
                                <i class="fas fa-tasks text-pale-orange-500 text-3xl mb-4"></i>
                                <h3 class="font-bold text-pale-orange-800 mb-2">Task Management</h3>
                                <p class="text-pale-orange-600 text-sm">Organize personal and project tasks</p>
                            </div>
                            <div class="glass-card p-6 rounded-2xl text-center">
                                <i class="fas fa-users text-pale-orange-500 text-3xl mb-4"></i>
                                <h3 class="font-bold text-pale-orange-800 mb-2">Team Collaboration</h3>
                                <p class="text-pale-orange-600 text-sm">Work together seamlessly with your team</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Load user's projects
        this.loadUserProjects();
    }

    toggleSidebar() {
        const sidebar = document.getElementById('sidebar');
        const overlay = document.getElementById('mobileOverlay');
        sidebar.classList.toggle('active');
        overlay.classList.toggle('active');
    }

    toggleProfileDropdown() {
        const dropdown = document.getElementById('profileDropdown');
        dropdown.classList.toggle('hidden');
    }

    logout() {
        localStorage.removeItem('synergyUser');
        this.currentUser = null;
        this.currentProject = null;
        this.showNotification('Logged out successfully', 'success');
        this.showLogin();
    }

    // Calendar View
    showMyCalendar() {
        const contentArea = document.getElementById('contentArea');
        contentArea.innerHTML = `
            <div class="max-w-6xl mx-auto fade-in">
                <div class="flex justify-between items-center mb-8">
                    <h1 class="text-3xl font-bold text-pale-orange-800">
                        <i class="fas fa-calendar-alt mr-3"></i>My Calendar
                    </h1>
                    <button onclick="app.showAddEventModal()" class="btn-primary text-white px-6 py-2 rounded-lg">
                        <i class="fas fa-plus mr-2"></i>Add Event
                    </button>
                </div>
                
                <div class="grid lg:grid-cols-3 gap-8">
                    <!-- Calendar -->
                    <div class="lg:col-span-2">
                        <div class="glass-card rounded-2xl p-6">
                            <div class="flex justify-between items-center mb-6">
                                <button onclick="app.changeMonth(-1)" class="p-2 hover:bg-pale-orange-100 rounded">
                                    <i class="fas fa-chevron-left"></i>
                                </button>
                                <h2 id="currentMonth" class="text-xl font-bold text-pale-orange-800"></h2>
                                <button onclick="app.changeMonth(1)" class="p-2 hover:bg-pale-orange-100 rounded">
                                    <i class="fas fa-chevron-right"></i>
                                </button>
                            </div>
                            
                            <!-- Calendar Header -->
                            <div class="calendar-grid mb-2">
                                <div class="text-center font-medium text-pale-orange-600 py-2">Sun</div>
                                <div class="text-center font-medium text-pale-orange-600 py-2">Mon</div>
                                <div class="text-center font-medium text-pale-orange-600 py-2">Tue</div>
                                <div class="text-center font-medium text-pale-orange-600 py-2">Wed</div>
                                <div class="text-center font-medium text-pale-orange-600 py-2">Thu</div>
                                <div class="text-center font-medium text-pale-orange-600 py-2">Fri</div>
                                <div class="text-center font-medium text-pale-orange-600 py-2">Sat</div>
                            </div>
                            
                            <!-- Calendar Days -->
                            <div id="calendarGrid" class="calendar-grid">
                                <!-- Days will be populated by JavaScript -->
                            </div>
                        </div>
                    </div>
                    
                    <!-- Upcoming Events -->
                    <div class="lg:col-span-1">
                        <div class="glass-card rounded-2xl p-6">
                            <h3 class="text-xl font-bold text-pale-orange-800 mb-6">Upcoming Events</h3>
                            <div id="upcomingEvents" class="space-y-4">
                                <!-- Events will be loaded here -->
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        this.currentCalendarDate = new Date();
        this.loadCalendar();
        this.loadUpcomingEvents();
    }

    changeMonth(direction) {
        this.currentCalendarDate.setMonth(this.currentCalendarDate.getMonth() + direction);
        this.loadCalendar();
    }

    loadCalendar() {
        const monthNames = ["January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"];
        
        document.getElementById('currentMonth').textContent = 
            `${monthNames[this.currentCalendarDate.getMonth()]} ${this.currentCalendarDate.getFullYear()}`;
        
        const firstDay = new Date(this.currentCalendarDate.getFullYear(), this.currentCalendarDate.getMonth(), 1);
        const lastDay = new Date(this.currentCalendarDate.getFullYear(), this.currentCalendarDate.getMonth() + 1, 0);
        const startDate = new Date(firstDay);
        startDate.setDate(startDate.getDate() - firstDay.getDay());
        
        const calendarGrid = document.getElementById('calendarGrid');
        calendarGrid.innerHTML = '';
        
        const today = new Date();
        
        for (let i = 0; i < 42; i++) {
            const date = new Date(startDate);
            date.setDate(startDate.getDate() + i);
            
            const dayElement = document.createElement('div');
            dayElement.className = 'calendar-day';
            dayElement.textContent = date.getDate();
            
            if (date.getMonth() !== this.currentCalendarDate.getMonth()) {
                dayElement.className += ' text-gray-400';
            }
            
            if (date.toDateString() === today.toDateString()) {
                dayElement.className += ' today';
            }
            
            dayElement.onclick = () => this.selectDate(date);
            calendarGrid.appendChild(dayElement);
        }
    }

    async loadUpcomingEvents() {
        try {
            const result = await this.apiCall(`/calendar/${this.currentUser.id}`);
            const eventsContainer = document.getElementById('upcomingEvents');
            
            if (result.events.length === 0) {
                eventsContainer.innerHTML = '<p class="text-pale-orange-600 text-center py-4">No upcoming events</p>';
                return;
            }
            
            const now = new Date();
            const upcomingEvents = result.events
                .filter(event => new Date(event.event_date) >= now)
                .slice(0, 5);
            
            eventsContainer.innerHTML = upcomingEvents.map(event => {
                const eventDate = new Date(event.event_date);
                return `
                    <div class="border-l-4 border-pale-orange-400 pl-4 py-2">
                        <div class="font-medium text-pale-orange-800">${event.title}</div>
                        <div class="text-sm text-pale-orange-600">
                            ${eventDate.toLocaleDateString()} at ${eventDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </div>
                        ${event.description ? `<div class="text-sm text-pale-orange-500 mt-1">${event.description}</div>` : ''}
                    </div>
                `;
            }).join('');
        } catch (error) {
            console.error('Error loading events:', error);
        }
    }

    selectDate(date) {
        this.selectedDate = date;
        this.showAddEventModal(date);
    }

    showAddEventModal(selectedDate = null) {
        const date = selectedDate || new Date();
        const formattedDate = date.toISOString().split('T')[0];
        const formattedTime = date.toTimeString().split(' ')[0].substring(0, 5);
        
        this.showModal(`
            <h3 class="text-2xl font-bold text-pale-orange-800 mb-6">Add New Event</h3>
            <form id="addEventForm" class="space-y-4">
                <div>
                    <label class="block text-pale-orange-700 font-medium mb-2">Event Title</label>
                    <input type="text" id="eventTitle" required 
                        class="w-full form-input px-4 py-2 border border-pale-orange-200 rounded-lg focus:border-pale-orange-400 focus:outline-none" 
                        placeholder="Enter event title">
                </div>
                
                <div>
                    <label class="block text-pale-orange-700 font-medium mb-2">Description</label>
                    <textarea id="eventDescription" rows="3"
                        class="w-full form-input px-4 py-2 border border-pale-orange-200 rounded-lg focus:border-pale-orange-400 focus:outline-none" 
                        placeholder="Event description (optional)"></textarea>
                </div>
                
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label class="block text-pale-orange-700 font-medium mb-2">Date</label>
                        <input type="date" id="eventDate" required 
                            class="w-full form-input px-4 py-2 border border-pale-orange-200 rounded-lg focus:border-pale-orange-400 focus:outline-none" 
                            value="${formattedDate}">
                    </div>
                    <div>
                        <label class="block text-pale-orange-700 font-medium mb-2">Time</label>
                        <input type="time" id="eventTime" required 
                            class="w-full form-input px-4 py-2 border border-pale-orange-200 rounded-lg focus:border-pale-orange-400 focus:outline-none" 
                            value="${formattedTime}">
                    </div>
                </div>
                
                <div class="flex space-x-4 pt-4">
                    <button type="submit" class="flex-1 btn-primary text-white py-2 rounded-lg">Add Event</button>
                    <button type="button" onclick="app.closeModal()" class="flex-1 btn-secondary text-pale-orange-800 py-2 rounded-lg">Cancel</button>
                </div>
            </form>
        `);
        
        document.getElementById('addEventForm').addEventListener('submit', (e) => this.handleAddEvent(e));
    }

    async handleAddEvent(e) {
        e.preventDefault();
        const title = document.getElementById('eventTitle').value;
        const description = document.getElementById('eventDescription').value;
        const date = document.getElementById('eventDate').value;
        const time = document.getElementById('eventTime').value;
        
        const eventDate = new Date(`${date}T${time}`);
        
        try {
            await this.apiCall('/calendar/create', 'POST', {
                userId: this.currentUser.id,
                title,
                description,
                eventDate: eventDate.toISOString()
            });
            
            this.showNotification('Event added successfully!', 'success');
            this.closeModal();
            this.loadUpcomingEvents();
        } catch (error) {
            console.error('Error adding event:', error);
        }
    }

    // Todo List View
    showTodoList() {
        const contentArea = document.getElementById('contentArea');
        contentArea.innerHTML = `
            <div class="max-w-4xl mx-auto fade-in">
                <div class="flex justify-between items-center mb-8">
                    <h1 class="text-3xl font-bold text-pale-orange-800">
                        <i class="fas fa-tasks mr-3"></i>My To-Do List
                    </h1>
                    <button onclick="app.showAddTodoModal()" class="btn-primary text-white px-6 py-2 rounded-lg">
                        <i class="fas fa-plus mr-2"></i>Add Task
                    </button>
                </div>
                
                <div class="glass-card rounded-2xl p-6">
                    <div id="todoList" class="space-y-3">
                        <!-- Todos will be loaded here -->
                    </div>
                    
                    <div id="emptyTodoState" class="hidden text-center py-8">
                        <i class="fas fa-clipboard-list text-pale-orange-300 text-4xl mb-4"></i>
                        <p class="text-pale-orange-600">No tasks yet. Add your first task to get started!</p>
                    </div>
                </div>
            </div>
        `;
        
        this.loadTodos();
    }

    async loadTodos() {
        try {
            const result = await this.apiCall(`/todos/${this.currentUser.id}`);
            const todoList = document.getElementById('todoList');
            const emptyState = document.getElementById('emptyTodoState');
            
            if (result.todos.length === 0) {
                todoList.classList.add('hidden');
                emptyState.classList.remove('hidden');
                return;
            }
            
            todoList.classList.remove('hidden');
            emptyState.classList.add('hidden');
            
            todoList.innerHTML = result.todos.map(todo => `
                <div class="flex items-center space-x-4 p-4 bg-white/50 rounded-lg hover:bg-white/70 transition-colors">
                    <input type="checkbox" ${todo.completed ? 'checked' : ''} 
                        onchange="app.toggleTodo(${todo.id}, this.checked)"
                        class="w-5 h-5 text-pale-orange-500 border-pale-orange-300 rounded focus:ring-pale-orange-200">
                    <span class="flex-1 ${todo.completed ? 'task-complete' : ''} text-pale-orange-800">
                        ${todo.title}
                    </span>
                    <span class="text-sm text-pale-orange-500">
                        ${new Date(todo.created_at).toLocaleDateString()}
                    </span>
                </div>
            `).join('');
        } catch (error) {
            console.error('Error loading todos:', error);
        }
    }

    showAddTodoModal() {
        this.showModal(`
            <h3 class="text-2xl font-bold text-pale-orange-800 mb-6">Add New Task</h3>
            <form id="addTodoForm" class="space-y-4">
                <div>
                    <label class="block text-pale-orange-700 font-medium mb-2">Task Title</label>
                    <input type="text" id="todoTitle" required 
                        class="w-full form-input px-4 py-2 border border-pale-orange-200 rounded-lg focus:border-pale-orange-400 focus:outline-none" 
                        placeholder="Enter task description">
                </div>
                
                <div class="flex space-x-4 pt-4">
                    <button type="submit" class="flex-1 btn-primary text-white py-2 rounded-lg">Add Task</button>
                    <button type="button" onclick="app.closeModal()" class="flex-1 btn-secondary text-pale-orange-800 py-2 rounded-lg">Cancel</button>
                </div>
            </form>
        `);
        
        document.getElementById('addTodoForm').addEventListener('submit', (e) => this.handleAddTodo(e));
    }

    async handleAddTodo(e) {
        e.preventDefault();
        const title = document.getElementById('todoTitle').value;
        
        try {
            await this.apiCall('/todos/create', 'POST', {
                userId: this.currentUser.id,
                title
            });
            
            this.showNotification('Task added successfully!', 'success');
            this.closeModal();
            this.loadTodos();
        } catch (error) {
            console.error('Error adding todo:', error);
        }
    }

    async toggleTodo(todoId, completed) {
        try {
            await this.apiCall(`/todos/${todoId}/complete`, 'PUT', { completed });
            this.loadTodos();
        } catch (error) {
            console.error('Error updating todo:', error);
        }
    }

    // My Projects View
    showMyProjects() {
        const contentArea = document.getElementById('contentArea');
        contentArea.innerHTML = `
            <div class="max-w-6xl mx-auto fade-in">
                <div class="flex justify-between items-center mb-8">
                    <h1 class="text-3xl font-bold text-pale-orange-800">
                        <i class="fas fa-project-diagram mr-3"></i>My Projects
                    </h1>
                    <button onclick="app.showProjectModal()" class="btn-primary text-white px-6 py-2 rounded-lg">
                        <i class="fas fa-plus mr-2"></i>New Project
                    </button>
                </div>
                
                <div id="projectsList" class="grid-responsive">
                    <!-- Projects will be loaded here -->
                </div>
                
                <div id="emptyProjectsState" class="hidden text-center py-12">
                    <i class="fas fa-project-diagram text-pale-orange-300 text-6xl mb-6"></i>
                    <h3 class="text-xl font-bold text-pale-orange-600 mb-4">No Projects Yet</h3>
                    <p class="text-pale-orange-500 mb-6">Create your first project or join an existing one to get started.</p>
                    <button onclick="app.showProjectModal()" class="btn-primary text-white px-6 py-3 rounded-lg">
                        <i class="fas fa-plus mr-2"></i>Create Project
                    </button>
                </div>
            </div>
        `;
        
        this.loadUserProjects();
    }

    async loadUserProjects() {
        try {
            const result = await this.apiCall(`/projects/user/${this.currentUser.id}`);
            const projectsList = document.getElementById('projectsList');
            const emptyState = document.getElementById('emptyProjectsState');
            
            if (result.projects.length === 0) {
                if (projectsList) projectsList.classList.add('hidden');
                if (emptyState) emptyState.classList.remove('hidden');
                return;
            }
            
            if (projectsList) projectsList.classList.remove('hidden');
            if (emptyState) emptyState.classList.add('hidden');
            
            if (projectsList) {
                projectsList.innerHTML = result.projects.map(project => `
                    <div class="project-card glass-card rounded-2xl p-6 cursor-pointer" onclick="app.openProject(${project.id})">
                        <div class="flex items-start justify-between mb-4">
                            <h3 class="text-xl font-bold text-pale-orange-800">${project.name}</h3>
                            <span class="px-3 py-1 text-xs rounded-full ${project.role === 'leader' ? 'bg-pale-orange-500 text-white' : 'bg-pale-orange-100 text-pale-orange-600'}">
                                ${project.role === 'leader' ? 'Leader' : 'Member'}
                            </span>
                        </div>
                        
                        <p class="text-pale-orange-600 text-sm mb-4 line-clamp-2">${project.description || 'No description available'}</p>
                        
                        <div class="flex items-center justify-between text-sm text-pale-orange-500">
                            <span><i class="fas fa-user mr-1"></i>Led by ${project.leader_name}</span>
                            <span><i class="fas fa-calendar mr-1"></i>${new Date(project.created_at).toLocaleDateString()}</span>
                        </div>
                    </div>
                `).join('');
            }
        } catch (error) {
            console.error('Error loading projects:', error);
        }
    }

    // Project Modal
    showProjectModal() {
        this.showModal(`
            <h3 class="text-2xl font-bold text-pale-orange-800 mb-6">Join or Create Project</h3>
            
            <div class="space-y-6">
                <div class="grid grid-cols-2 gap-4">
                    <button onclick="app.showCreateProjectForm()" class="btn-primary text-white py-4 rounded-lg text-center">
                        <i class="fas fa-plus mb-2 block text-2xl"></i>
                        <span class="font-medium">Create Project</span>
                    </button>
                    <button onclick="app.showJoinProjectForm()" class="btn-secondary text-pale-orange-800 py-4 rounded-lg text-center">
                        <i class="fas fa-sign-in-alt mb-2 block text-2xl"></i>
                        <span class="font-medium">Join Project</span>
                    </button>
                </div>
                
                <button onclick="app.closeModal()" class="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 py-2 rounded-lg">
                    Cancel
                </button>
            </div>
        `);
    }

    showCreateProjectForm() {
        this.showModal(`
            <h3 class="text-2xl font-bold text-pale-orange-800 mb-6">Create New Project</h3>
            <form id="createProjectForm" class="space-y-4">
                <div>
                    <label class="block text-pale-orange-700 font-medium mb-2">Project Name</label>
                    <input type="text" id="projectName" required 
                        class="w-full form-input px-4 py-2 border border-pale-orange-200 rounded-lg focus:border-pale-orange-400 focus:outline-none" 
                        placeholder="Enter project name">
                </div>
                
                <div>
                    <label class="block text-pale-orange-700 font-medium mb-2">Project Description</label>
                    <textarea id="projectDescription" rows="4"
                        class="w-full form-input px-4 py-2 border border-pale-orange-200 rounded-lg focus:border-pale-orange-400 focus:outline-none" 
                        placeholder="Describe your project (optional)"></textarea>
                </div>
                
                <div class="flex space-x-4 pt-4">
                    <button type="submit" class="flex-1 btn-primary text-white py-2 rounded-lg">Create Project</button>
                    <button type="button" onclick="app.closeModal()" class="flex-1 btn-secondary text-pale-orange-800 py-2 rounded-lg">Cancel</button>
                </div>
            </form>
        `);
        
        document.getElementById('createProjectForm').addEventListener('submit', (e) => this.handleCreateProject(e));
    }

    showJoinProjectForm() {
        this.showModal(`
            <h3 class="text-2xl font-bold text-pale-orange-800 mb-6">Join Existing Project</h3>
            <form id="joinProjectForm" class="space-y-4">
                <div>
                    <label class="block text-pale-orange-700 font-medium mb-2">Project Code</label>
                    <input type="text" id="projectCode" required 
                        class="w-full form-input px-4 py-2 border border-pale-orange-200 rounded-lg focus:border-pale-orange-400 focus:outline-none text-center text-lg tracking-widest" 
                        placeholder="Enter 6-character code"
                        maxlength="6"
                        style="text-transform: uppercase;">
                </div>
                
                <div class="bg-pale-orange-50 p-4 rounded-lg">
                    <p class="text-sm text-pale-orange-600">
                        <i class="fas fa-info-circle mr-2"></i>
                        Ask your team leader for the project code to join their project.
                    </p>
                </div>
                
                <div class="flex space-x-4 pt-4">
                    <button type="submit" class="flex-1 btn-primary text-white py-2 rounded-lg">Join Project</button>
                    <button type="button" onclick="app.closeModal()" class="flex-1 btn-secondary text-pale-orange-800 py-2 rounded-lg">Cancel</button>
                </div>
            </form>
        `);
        
        document.getElementById('joinProjectForm').addEventListener('submit', (e) => this.handleJoinProject(e));
        
        // Auto-uppercase project code input
        document.getElementById('projectCode').addEventListener('input', function(e) {
            this.value = this.value.toUpperCase();
        });
    }

    async handleCreateProject(e) {
        e.preventDefault();
        const name = document.getElementById('projectName').value;
        const description = document.getElementById('projectDescription').value;
        
        try {
            const result = await this.apiCall('/projects/create', 'POST', {
                name,
                description,
                userId: this.currentUser.id
            });
            
            this.showNotification(`Project created! Share code: ${result.project.project_code}`, 'success');
            this.closeModal();
            
            // Show project code modal
            this.showProjectCodeModal(result.project);
            
            // Refresh projects list if on projects page
            if (this.currentView === 'dashboard') {
                this.loadUserProjects();
            }
        } catch (error) {
            console.error('Error creating project:', error);
        }
    }

    showProjectCodeModal(project) {
        this.showModal(`
            <div class="text-center">
                <div class="w-20 h-20 bg-gradient-to-br from-pale-orange-400 to-pale-orange-600 rounded-full mx-auto mb-6 flex items-center justify-center">
                    <i class="fas fa-check text-white text-2xl"></i>
                </div>
                
                <h3 class="text-2xl font-bold text-pale-orange-800 mb-4">Project Created Successfully!</h3>
                <p class="text-pale-orange-600 mb-6">Share this code with your team members so they can join:</p>
                
                <div class="bg-pale-orange-100 p-6 rounded-lg mb-6">
                    <div class="text-3xl font-bold text-pale-orange-800 tracking-widest mb-2">${project.project_code}</div>
                    <button onclick="navigator.clipboard.writeText('${project.project_code}'); app.showNotification('Code copied to clipboard!', 'success')" 
                        class="text-pale-orange-600 hover:text-pale-orange-800 text-sm">
                        <i class="fas fa-copy mr-1"></i>Copy Code
                    </button>
                </div>
                
                <div class="space-y-3">
                    <button onclick="app.openProject(${project.id})" class="w-full btn-primary text-white py-2 rounded-lg">
                        Open Project
                    </button>
                    <button onclick="app.closeModal()" class="w-full btn-secondary text-pale-orange-800 py-2 rounded-lg">
                        Done
                    </button>
                </div>
            </div>
        `);
    }

    async handleJoinProject(e) {
        e.preventDefault();
        const projectCode = document.getElementById('projectCode').value;
        
        try {
            const result = await this.apiCall('/projects/join', 'POST', {
                projectCode,
                userId: this.currentUser.id
            });
            
            this.showNotification(`Successfully joined ${result.project.name}!`, 'success');
            this.closeModal();
            this.openProject(result.project.id);
        } catch (error) {
            console.error('Error joining project:', error);
        }
    }

    // Project Page
    async openProject(projectId) {
        try {
            const result = await this.apiCall(`/projects/${projectId}`);
            this.currentProject = result.project;
            this.showProjectPage();
        } catch (error) {
            console.error('Error loading project:', error);
        }
    }

    showProjectPage() {
        const contentArea = document.getElementById('contentArea');
        contentArea.innerHTML = `
            <div class="max-w-7xl mx-auto fade-in">
                <!-- Project Header -->
                <div class="glass-card rounded-2xl p-6 mb-8">
                    <div class="flex flex-col md:flex-row md:items-center justify-between mb-4">
                        <div>
                            <h1 class="text-3xl font-bold text-pale-orange-800 mb-2">${this.currentProject.name}</h1>
                            <p class="text-pale-orange-600">
                                <i class="fas fa-crown mr-1"></i>Team Leader: ${this.currentProject.leader_name}
                            </p>
                        </div>
                        <div class="flex space-x-2 mt-4 md:mt-0">
                            <span class="px-3 py-1 bg-pale-orange-100 text-pale-orange-600 rounded-full text-sm">
                                Code: ${this.currentProject.project_code}
                            </span>
                        </div>
                    </div>
                </div>
                
                <!-- Project Navigation -->
                <div class="glass-card rounded-2xl p-2 mb-8">
                    <nav class="flex space-x-2 overflow-x-auto">
                        <button onclick="app.showProjectTab('description')" class="project-tab active px-6 py-3 rounded-lg whitespace-nowrap">
                            <i class="fas fa-info-circle mr-2"></i>Description
                        </button>
                        <button onclick="app.showProjectTab('progress')" class="project-tab px-6 py-3 rounded-lg whitespace-nowrap">
                            <i class="fas fa-chart-line mr-2"></i>Progress
                        </button>
                        <button onclick="app.showProjectTab('noticeboard')" class="project-tab px-6 py-3 rounded-lg whitespace-nowrap">
                            <i class="fas fa-clipboard mr-2"></i>Notice Board
                        </button>
                        <button onclick="app.showProjectTab('chatroom')" class="project-tab px-6 py-3 rounded-lg whitespace-nowrap">
                            <i class="fas fa-comments mr-2"></i>Chat Room
                        </button>
                        <button onclick="app.showProjectTab('documents')" class="project-tab px-6 py-3 rounded-lg whitespace-nowrap">
                            <i class="fas fa-folder mr-2"></i>Documents
                        </button>
                    </nav>
                </div>
                
                <!-- Project Content -->
                <div id="projectTabContent">
                    <!-- Content will be loaded here based on selected tab -->
                </div>
            </div>
        `;
        
        this.showProjectTab('description');
    }

    showProjectTab(tabName) {
        // Update active tab
        document.querySelectorAll('.project-tab').forEach(tab => {
            tab.classList.remove('active', 'btn-primary', 'text-white');
            tab.classList.add('hover:bg-pale-orange-100', 'text-pale-orange-600');
        });
        event.target.classList.add('active', 'btn-primary', 'text-white');
        event.target.classList.remove('hover:bg-pale-orange-100', 'text-pale-orange-600');
        
        const content = document.getElementById('projectTabContent');
        
        switch (tabName) {
            case 'description':
                this.showDescriptionTab(content);
                break;
            case 'progress':
                this.showProgressTab(content);
                break;
            case 'noticeboard':
                this.showNoticeboardTab(content);
                break;
            case 'chatroom':
                this.showChatroomTab(content);
                break;
            case 'documents':
                this.showDocumentsTab(content);
                break;
        }
    }

    showDescriptionTab(content) {
        content.innerHTML = `
            <div class="glass-card rounded-2xl p-8">
                <h2 class="text-2xl font-bold text-pale-orange-800 mb-6">Project Description</h2>
                
                <div class="prose max-w-none">
                    <div class="bg-pale-orange-50 p-6 rounded-lg mb-6">
                        <p class="text-pale-orange-700 leading-relaxed">
                            ${this.currentProject.description || 'No description provided for this project yet.'}
                        </p>
                    </div>
                </div>
                
                <div class="grid md:grid-cols-2 gap-6 mt-8">
                    <div class="bg-white/50 p-4 rounded-lg">
                        <h4 class="font-bold text-pale-orange-800 mb-2">Project Details</h4>
                        <div class="space-y-2 text-sm text-pale-orange-600">
                            <div><strong>Created:</strong> ${new Date(this.currentProject.created_at).toLocaleDateString()}</div>
                            <div><strong>Team Leader:</strong> ${this.currentProject.leader_name}</div>
                            <div><strong>Project Code:</strong> ${this.currentProject.project_code}</div>
                        </div>
                    </div>
                    
                    <div class="bg-white/50 p-4 rounded-lg">
                        <h4 class="font-bold text-pale-orange-800 mb-2">Team Members</h4>
                        <div class="space-y-1 text-sm text-pale-orange-600">
                            ${this.currentProject.members.map(member => `
                                <div class="flex items-center space-x-2">
                                    <i class="fas fa-user text-xs"></i>
                                    <span>${member.username}</span>
                                    ${member.role === 'leader' ? '<span class="text-pale-orange-500 text-xs">(Leader)</span>' : ''}
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    showProgressTab(content) {
        content.innerHTML = `
            <div class="space-y-6">
                <!-- Progress Overview -->
                <div class="glass-card rounded-2xl p-6">
                    <div class="flex justify-between items-center mb-6">
                        <h2 class="text-2xl font-bold text-pale-orange-800">Project Progress</h2>
                        ${this.isTeamLeader() ? `
                            <button onclick="app.showAddTaskModal()" class="btn-primary text-white px-4 py-2 rounded-lg">
                                <i class="fas fa-plus mr-2"></i>Assign Task
                            </button>
                        ` : ''}
                    </div>
                    
                    <div id="progressOverview" class="mb-6">
                        <!-- Progress bar will be loaded here -->
                    </div>
                </div>
                
                <!-- Tasks List -->
                <div class="glass-card rounded-2xl p-6">
                    <h3 class="text-xl font-bold text-pale-orange-800 mb-6">Project Tasks</h3>
                    <div id="projectTasks" class="space-y-4">
                        <!-- Tasks will be loaded here -->
                    </div>
                </div>
            </div>
        `;
        
        this.loadProjectTasks();
    }

    async loadProjectTasks() {
        try {
            const result = await this.apiCall(`/projects/${this.currentProject.id}/tasks`);
            const tasksContainer = document.getElementById('projectTasks');
            const progressContainer = document.getElementById('progressOverview');
            
            const tasks = result.tasks;
            const completedTasks = tasks.filter(task => task.completed).length;
            const totalTasks = tasks.length;
            const progressPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
            
            // Update progress overview
            progressContainer.innerHTML = `
                <div class="flex items-center justify-between mb-4">
                    <span class="text-pale-orange-700 font-medium">Overall Progress</span>
                    <span class="text-pale-orange-600">${completedTasks}/${totalTasks} tasks completed</span>
                </div>
                <div class="progress-bar w-full bg-pale-orange-100 rounded-full h-4">
                    <div class="progress-fill bg-gradient-to-r from-pale-orange-400 to-pale-orange-500 h-4 rounded-full transition-all duration-500" 
                         style="width: ${progressPercentage}%"></div>
                </div>
                <div class="text-center mt-2">
                    <span class="text-2xl font-bold text-pale-orange-600">${progressPercentage}%</span>
                </div>
            `;
            
            // Update tasks list
            if (tasks.length === 0) {
                tasksContainer.innerHTML = `
                    <div class="text-center py-8">
                        <i class="fas fa-tasks text-pale-orange-300 text-4xl mb-4"></i>
                        <p class="text-pale-orange-600">No tasks assigned yet.</p>
                        ${this.isTeamLeader() ? '<p class="text-pale-orange-500 mt-2">Start by assigning tasks to team members.</p>' : ''}
                    </div>
                `;
                return;
            }
            
            tasksContainer.innerHTML = tasks.map(task => {
                const isOverdue = task.deadline && new Date(task.deadline) < new Date() && !task.completed;
                return `
                    <div class="bg-white/50 p-4 rounded-lg border-l-4 ${task.completed ? 'border-green-400' : isOverdue ? 'border-red-400' : 'border-pale-orange-400'}">
                        <div class="flex items-start justify-between mb-2">
                            <div class="flex items-center space-x-3">
                                <input type="checkbox" ${task.completed ? 'checked' : ''} 
                                    ${task.assigned_to === this.currentUser.id || this.isTeamLeader() ? '' : 'disabled'}
                                    onchange="app.toggleTask(${task.id}, this.checked)"
                                    class="w-5 h-5 text-pale-orange-500 border-pale-orange-300 rounded focus:ring-pale-orange-200">
                                <h4 class="font-medium text-pale-orange-800 ${task.completed ? 'task-complete' : ''}">${task.title}</h4>
                            </div>
                            ${this.isTeamLeader() && !task.completed ? `
                                <button onclick="app.deleteTask(${task.id})" class="text-red-500 hover:text-red-700 text-sm">
                                    <i class="fas fa-trash"></i>
                                </button>
                            ` : ''}
                        </div>
                        
                        ${task.description ? `<p class="text-pale-orange-600 text-sm mb-2">${task.description}</p>` : ''}
                        
                        <div class="flex items-center justify-between text-sm text-pale-orange-500">
                            <div class="flex items-center space-x-4">
                                <span>
                                    <i class="fas fa-user mr-1"></i>
                                    ${task.assigned_to_name || 'Unassigned'}
                                </span>
                                <span>
                                    <i class="fas fa-user-plus mr-1"></i>
                                    By ${task.created_by_name}
                                </span>
                            </div>
                            ${task.deadline ? `
                                <span class="${isOverdue ? 'text-red-500 font-medium' : ''}">
                                    <i class="fas fa-calendar mr-1"></i>
                                    Due: ${new Date(task.deadline).toLocaleDateString()}
                                </span>
                            ` : ''}
                        </div>
                    </div>
                `;
            }).join('');
        } catch (error) {
            console.error('Error loading tasks:', error);
        }
    }

    isTeamLeader() {
        return this.currentProject && this.currentProject.team_leader_id === this.currentUser.id;
    }

    showAddTaskModal() {
        if (!this.isTeamLeader()) return;
        
        const memberOptions = this.currentProject.members.map(member => 
            `<option value="${member.id}">${member.username}</option>`
        ).join('');
        
        this.showModal(`
            <h3 class="text-2xl font-bold text-pale-orange-800 mb-6">Assign New Task</h3>
            <form id="addTaskForm" class="space-y-4">
                <div>
                    <label class="block text-pale-orange-700 font-medium mb-2">Task Title</label>
                    <input type="text" id="taskTitle" required 
                        class="w-full form-input px-4 py-2 border border-pale-orange-200 rounded-lg focus:border-pale-orange-400 focus:outline-none" 
                        placeholder="Enter task title">
                </div>
                
                <div>
                    <label class="block text-pale-orange-700 font-medium mb-2">Description</label>
                    <textarea id="taskDescription" rows="3"
                        class="w-full form-input px-4 py-2 border border-pale-orange-200 rounded-lg focus:border-pale-orange-400 focus:outline-none" 
                        placeholder="Task description (optional)"></textarea>
                </div>
                
                <div>
                    <label class="block text-pale-orange-700 font-medium mb-2">Assign To</label>
                    <select id="taskAssignee" required 
                        class="w-full form-input px-4 py-2 border border-pale-orange-200 rounded-lg focus:border-pale-orange-400 focus:outline-none">
                        <option value="">Select team member</option>
                        ${memberOptions}
                    </select>
                </div>
                
                <div>
                    <label class="block text-pale-orange-700 font-medium mb-2">Deadline (optional)</label>
                    <input type="datetime-local" id="taskDeadline"
                        class="w-full form-input px-4 py-2 border border-pale-orange-200 rounded-lg focus:border-pale-orange-400 focus:outline-none">
                </div>
                
                <div class="flex space-x-4 pt-4">
                    <button type="submit" class="flex-1 btn-primary text-white py-2 rounded-lg">Assign Task</button>
                    <button type="button" onclick="app.closeModal()" class="flex-1 btn-secondary text-pale-orange-800 py-2 rounded-lg">Cancel</button>
                </div>
            </form>
        `);
        
        document.getElementById('addTaskForm').addEventListener('submit', (e) => this.handleAddTask(e));
    }

    async handleAddTask(e) {
        e.preventDefault();
        const title = document.getElementById('taskTitle').value;
        const description = document.getElementById('taskDescription').value;
        const assignedTo = document.getElementById('taskAssignee').value;
        const deadline = document.getElementById('taskDeadline').value;
        
        try {
            await this.apiCall('/tasks/create', 'POST', {
                projectId: this.currentProject.id,
                assignedTo: assignedTo || null,
                title,
                description,
                deadline: deadline || null,
                createdBy: this.currentUser.id
            });
            
            this.showNotification('Task assigned successfully!', 'success');
            this.closeModal();
            this.loadProjectTasks();
        } catch (error) {
            console.error('Error assigning task:', error);
        }
    }

    async toggleTask(taskId, completed) {
        try {
            await this.apiCall(`/tasks/${taskId}/complete`, 'PUT', { completed });
            this.loadProjectTasks();
            
            if (completed) {
                this.showNotification('Task marked as completed!', 'success');
            }
        } catch (error) {
            console.error('Error updating task:', error);
        }
    }

    showNoticeboardTab(content) {
        content.innerHTML = `
            <div class="glass-card rounded-2xl p-6">
                <div class="flex justify-between items-center mb-6">
                    <h2 class="text-2xl font-bold text-pale-orange-800">Notice Board</h2>
                    ${this.isTeamLeader() ? `
                        <button onclick="app.showAddNoticeModal()" class="btn-primary text-white px-4 py-2 rounded-lg">
                            <i class="fas fa-plus mr-2"></i>Post Notice
                        </button>
                    ` : ''}
                </div>
                
                <div id="noticesList" class="space-y-4">
                    <!-- Notices will be loaded here -->
                </div>
            </div>
        `;
        
        this.loadNotices();
    }

    async loadNotices() {
        try {
            const result = await this.apiCall(`/projects/${this.currentProject.id}/notices`);
            const noticesContainer = document.getElementById('noticesList');
            
            if (result.notices.length === 0) {
                noticesContainer.innerHTML = `
                    <div class="text-center py-8">
                        <i class="fas fa-clipboard text-pale-orange-300 text-4xl mb-4"></i>
                        <p class="text-pale-orange-600">No notices posted yet.</p>
                        ${this.isTeamLeader() ? '<p class="text-pale-orange-500 mt-2">Post the first notice to keep your team informed.</p>' : ''}
                    </div>
                `;
                return;
            }
            
            noticesContainer.innerHTML = result.notices.map(notice => `
                <div class="bg-white/50 p-6 rounded-lg border-l-4 border-pale-orange-400">
                    <div class="flex justify-between items-start mb-3">
                        <h4 class="text-lg font-bold text-pale-orange-800">${notice.title}</h4>
                        <span class="text-sm text-pale-orange-500">${new Date(notice.created_at).toLocaleDateString()}</span>
                    </div>
                    <p class="text-pale-orange-700 mb-3 leading-relaxed">${notice.content}</p>
                    <div class="text-sm text-pale-orange-500">
                        <i class="fas fa-user mr-1"></i>Posted by ${notice.author_name}
                    </div>
                </div>
            `).join('');
        } catch (error) {
            console.error('Error loading notices:', error);
        }
    }

    showAddNoticeModal() {
        if (!this.isTeamLeader()) return;
        
        this.showModal(`
            <h3 class="text-2xl font-bold text-pale-orange-800 mb-6">Post New Notice</h3>
            <form id="addNoticeForm" class="space-y-4">
                <div>
                    <label class="block text-pale-orange-700 font-medium mb-2">Notice Title</label>
                    <input type="text" id="noticeTitle" required 
                        class="w-full form-input px-4 py-2 border border-pale-orange-200 rounded-lg focus:border-pale-orange-400 focus:outline-none" 
                        placeholder="Enter notice title">
                </div>
                
                <div>
                    <label class="block text-pale-orange-700 font-medium mb-2">Notice Content</label>
                    <textarea id="noticeContent" rows="6" required
                        class="w-full form-input px-4 py-2 border border-pale-orange-200 rounded-lg focus:border-pale-orange-400 focus:outline-none" 
                        placeholder="Write your notice content here..."></textarea>
                </div>
                
                <div class="flex space-x-4 pt-4">
                    <button type="submit" class="flex-1 btn-primary text-white py-2 rounded-lg">Post Notice</button>
                    <button type="button" onclick="app.closeModal()" class="flex-1 btn-secondary text-pale-orange-800 py-2 rounded-lg">Cancel</button>
                </div>
            </form>
        `);
        
        document.getElementById('addNoticeForm').addEventListener('submit', (e) => this.handleAddNotice(e));
    }

    async handleAddNotice(e) {
        e.preventDefault();
        const title = document.getElementById('noticeTitle').value;
        const content = document.getElementById('noticeContent').value;
        
        try {
            await this.apiCall('/notices/create', 'POST', {
                projectId: this.currentProject.id,
                authorId: this.currentUser.id,
                title,
                content
            });
            
            this.showNotification('Notice posted successfully!', 'success');
            this.closeModal();
            this.loadNotices();
        } catch (error) {
            console.error('Error posting notice:', error);
        }
    }

    showChatroomTab(content) {
        content.innerHTML = `
            <div class="glass-card rounded-2xl p-6">
                <h2 class="text-2xl font-bold text-pale-orange-800 mb-6">Team Chat</h2>
                
                <!-- Chat Messages -->
                <div id="chatMessages" class="chat-container bg-white/30 rounded-lg p-4 mb-4 border">
                    <!-- Messages will be loaded here -->
                </div>
                
                <!-- Message Input -->
                <form id="chatForm" class="flex space-x-4">
                    <input type="text" id="chatMessage" required 
                        class="flex-1 form-input px-4 py-2 border border-pale-orange-200 rounded-lg focus:border-pale-orange-400 focus:outline-none" 
                        placeholder="Type your message...">
                    <button type="submit" class="btn-primary text-white px-6 py-2 rounded-lg">
                        <i class="fas fa-paper-plane"></i>
                    </button>
                </form>
                
                <!-- Video Meeting Button -->
                <div class="mt-6 text-center">
                    <button onclick="app.startVideoMeeting()" class="btn-secondary text-pale-orange-800 px-6 py-3 rounded-lg">
                        <i class="fas fa-video mr-2"></i>Start Video Meeting
                    </button>
                </div>
            </div>
        `;
        
        document.getElementById('chatForm').addEventListener('submit', (e) => this.handleSendMessage(e));
        this.loadChatMessages();
    }

    async loadChatMessages() {
        try {
            const result = await this.apiCall(`/projects/${this.currentProject.id}/messages`);
            const messagesContainer = document.getElementById('chatMessages');
            
            if (result.messages.length === 0) {
                messagesContainer.innerHTML = `
                    <div class="text-center py-8">
                        <i class="fas fa-comments text-pale-orange-300 text-4xl mb-4"></i>
                        <p class="text-pale-orange-600">No messages yet. Start the conversation!</p>
                    </div>
                `;
                return;
            }
            
            messagesContainer.innerHTML = result.messages.map(message => {
                const isOwn = message.user_id === this.currentUser.id;
                return `
                    <div class="chat-message ${isOwn ? 'own' : 'other'}">
                        <div class="text-xs opacity-75 mb-1">
                            ${isOwn ? 'You' : message.username} • ${new Date(message.created_at).toLocaleTimeString()}
                        </div>
                        <div>${message.message}</div>
                    </div>
                `;
            }).join('');
            
            // Scroll to bottom
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        } catch (error) {
            console.error('Error loading messages:', error);
        }
    }

    async handleSendMessage(e) {
        e.preventDefault();
        const message = document.getElementById('chatMessage').value.trim();
        
        if (!message) return;
        
        try {
            await this.apiCall('/messages/create', 'POST', {
                projectId: this.currentProject.id,
                userId: this.currentUser.id,
                message
            });
            
            document.getElementById('chatMessage').value = '';
            this.loadChatMessages();
        } catch (error) {
            console.error('Error sending message:', error);
        }
    }

    startVideoMeeting() {
        this.showNotification('Video meeting feature will be implemented in the next version.', 'info');
    }

    showDocumentsTab(content) {
        content.innerHTML = `
            <div class="glass-card rounded-2xl p-6">
                <div class="flex justify-between items-center mb-6">
                    <h2 class="text-2xl font-bold text-pale-orange-800">Important Documents</h2>
                    <button onclick="app.showUploadModal()" class="btn-primary text-white px-4 py-2 rounded-lg">
                        <i class="fas fa-upload mr-2"></i>Upload Document
                    </button>
                </div>
                
                <div id="documentsList" class="space-y-4">
                    <div class="text-center py-12">
                        <i class="fas fa-folder-open text-pale-orange-300 text-6xl mb-6"></i>
                        <h3 class="text-xl font-bold text-pale-orange-600 mb-4">No Documents Yet</h3>
                        <p class="text-pale-orange-500 mb-6">Upload important files like PDFs, images, and documents to share with your team.</p>
                        <button onclick="app.showUploadModal()" class="btn-primary text-white px-6 py-3 rounded-lg">
                            <i class="fas fa-upload mr-2"></i>Upload First Document
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    showUploadModal() {
        this.showNotification('File upload feature will be implemented in the next version with Cloudflare R2 storage.', 'info');
    }

    // Modal System
    showModal(content) {
        const modal = document.createElement('div');
        modal.id = 'modal';
        modal.className = 'modal-backdrop';
        modal.innerHTML = `
            <div class="modal-content max-w-2xl w-full mx-4">
                ${content}
            </div>
        `;
        
        document.body.appendChild(modal);
        setTimeout(() => modal.classList.add('active'), 100);
        
        // Close on backdrop click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) this.closeModal();
        });
    }

    closeModal() {
        const modal = document.getElementById('modal');
        if (modal) {
            modal.classList.remove('active');
            setTimeout(() => modal.remove(), 300);
        }
    }
}

// Initialize the application
const app = new SynergyApp();