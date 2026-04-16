// TeamFlow PM - Frontend Application
// Uses Express REST API backend (not Supabase)

const API_BASE_URL = window.__API_BASE_URL__ || 'http://localhost:3000/api';
let currentUser = null;
let currentToken = null;
let currentWorkspace = null;
let currentBoard = null;

// PERF: Cache for API responses to prevent duplicate requests
const apiCache = new Map();
const CACHE_TTL = 30000; // 30 seconds

// PERF: Debounce utility for input handlers
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// DOM Elements
const appEl = document.getElementById('app');
const loadingEl = document.getElementById('loading');

// Initialize the application
async function init() {
    try {
        // Check for credentials
        if (!window.__API_BASE_URL__) {
            showErrorBanner('API base URL not configured. Please set window.__API_BASE_URL__');
        }
        
        // Try to get existing session
        const token = localStorage.getItem('teamflow_token');
        if (token) {
            currentToken = token;
            await fetchCurrentUser();
        }
        
        render();
    } catch (error) {
        console.error('Initialization error:', error);
        // Continue to render auth page
    } finally {
        // Always hide loading and show app
        loadingEl.classList.add('hidden');
        appEl.classList.add('loaded');
    }
}

// API Helper with caching and deduplication
async function apiFetch(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const cacheKey = `${url}_${JSON.stringify(options.body || {})}`;
    
    // PERF: Check cache for GET requests
    if (options.method === 'GET' || !options.method) {
        const cached = apiCache.get(cacheKey);
        if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
            return cached.data;
        }
    }
    
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
    };
    
    if (currentToken) {
        headers['Authorization'] = `Bearer ${currentToken}`;
    }
    
    try {
        const response = await fetch(url, {
            ...options,
            headers,
        });
        
        if (response.status === 401) {
            // Token expired or invalid
            logout();
            throw new Error('Session expired. Please sign in again.');
        }
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || `API error: ${response.status}`);
        }
        
        // PERF: Cache successful GET responses
        if (options.method === 'GET' || !options.method) {
            apiCache.set(cacheKey, {
                data,
                timestamp: Date.now()
            });
        }
        
        return data;
    } catch (error) {
        console.error(`API fetch error (${endpoint}):`, error.message);
        throw error;
    }
}

// PERF: Clear cache utility
function clearApiCache() {
    apiCache.clear();
}

// Auth Functions
async function signUp(email, password, name) {
    try {
        const data = await apiFetch('/auth/register', {
            method: 'POST',
            body: JSON.stringify({ email, password, name }),
        });
        
        showMessage('success', 'Account created! Please check your email to verify your account.');
        return { success: true, data };
    } catch (error) {
        showMessage('error', error.message);
        return { success: false, error: error.message };
    }
}

async function signIn(email, password) {
    try {
        const data = await apiFetch('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
        });
        
        currentToken = data.token;
        localStorage.setItem('teamflow_token', data.token);
        await fetchCurrentUser();
        
        showMessage('success', 'Signed in successfully!');
        return { success: true };
    } catch (error) {
        showMessage('error', error.message);
        return { success: false, error: error.message };
    }
}

async function fetchCurrentUser() {
    try {
        const data = await apiFetch('/auth/me');
        currentUser = data.user;
        return currentUser;
    } catch (error) {
        console.error('Failed to fetch current user:', error.message);
        logout();
        return null;
    }
}

function logout() {
    currentUser = null;
    currentToken = null;
    currentWorkspace = null;
    currentBoard = null;
    localStorage.removeItem('teamflow_token');
    clearApiCache(); // PERF: Clear cache on logout
    render();
}

// Workspace Functions
async function fetchWorkspaces() {
    try {
        const data = await apiFetch('/workspaces');
        return data.workspaces || [];
    } catch (error) {
        showMessage('error', `Failed to load workspaces: ${error.message}`);
        return [];
    }
}

async function createWorkspace(name, description) {
    try {
        const data = await apiFetch('/workspaces', {
            method: 'POST',
            body: JSON.stringify({ name, description }),
        });
        
        clearApiCache(); // PERF: Clear cache after mutation
        showMessage('success', 'Workspace created successfully!');
        return { success: true, workspace: data.workspace };
    } catch (error) {
        showMessage('error', error.message);
        return { success: false, error: error.message };
    }
}

async function selectWorkspace(workspace) {
    currentWorkspace = workspace;
    clearApiCache(); // PERF: Clear cache when switching contexts
    render();
}

// Board Functions
async function fetchBoards(workspaceId) {
    try {
        const data = await apiFetch(`/workspaces/${workspaceId}/boards`);
        return data.boards || [];
    } catch (error) {
        showMessage('error', `Failed to load boards: ${error.message}`);
        return [];
    }
}

async function createBoard(workspaceId, name, description) {
    try {
        const data = await apiFetch(`/workspaces/${workspaceId}/boards`, {
            method: 'POST',
            body: JSON.stringify({ name, description }),
        });
        
        clearApiCache(); // PERF: Clear cache after mutation
        showMessage('success', 'Board created successfully!');
        return { success: true, board: data.board };
    } catch (error) {
        showMessage('error', error.message);
        return { success: false, error: error.message };
    }
}

async function selectBoard(board) {
    currentBoard = board;
    clearApiCache(); // PERF: Clear cache when switching contexts
    render();
}

// Task Functions
async function fetchTasks(boardId) {
    try {
        const data = await apiFetch(`/boards/${boardId}/tasks`);
        return data.tasks || [];
    } catch (error) {
        showMessage('error', `Failed to load tasks: ${error.message}`);
        return [];
    }
}

async function createTask(boardId, taskData) {
    try {
        const data = await apiFetch(`/boards/${boardId}/tasks`, {
            method: 'POST',
            body: JSON.stringify(taskData),
        });
        
        clearApiCache(); // PERF: Clear cache after mutation
        showMessage('success', 'Task created successfully!');
        return { success: true, task: data.task };
    } catch (error) {
        showMessage('error', error.message);
        return { success: false, error: error.message };
    }
}

async function updateTask(taskId, updates) {
    try {
        const data = await apiFetch(`/tasks/${taskId}`, {
            method: 'PUT',
            body: JSON.stringify(updates),
        });
        
        clearApiCache(); // PERF: Clear cache after mutation
        return { success: true, task: data.task };
    } catch (error) {
        showMessage('error', `Failed to update task: ${error.message}`);
        return { success: false, error: error.message };
    }
}

// Stripe Functions
async function createCheckoutSession(priceId) {
    try {
        const data = await apiFetch('/stripe/create-checkout-session', {
            method: 'POST',
            body: JSON.stringify({ priceId }),
        });
        
        if (data.sessionId) {
            // Redirect to Stripe Checkout
            window.location.href = data.sessionUrl;
        }
    } catch (error) {
        showMessage('error', `Failed to create checkout session: ${error.message}`);
    }
}

// UI Helper Functions
function showMessage(type, text) {
    // Create message element
    const messageEl = document.createElement('div');
    messageEl.className = `message message-${type}`;
    messageEl.textContent = text;
    messageEl.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 12px 20px;
        border-radius: 8px;
        background-color: ${type === 'error' ? '#7f1d1d' : '#065f46'};
        color: ${type === 'error' ? '#fecaca' : '#a7f3d0'};
        z-index: 1000;
        box-shadow: 0 4px 6px rgba(0,0,0,0.3);
        animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(messageEl);
    
    // Remove after 5 seconds
    setTimeout(() => {
        messageEl.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => messageEl.remove(), 300);
    }, 5000);
}

function showErrorBanner(text) {
    const banner = document.createElement('div');
    banner.className = 'error-banner';
    banner.textContent = text;
    document.body.prepend(banner);
}

// PERF: Optimized render function with minimal DOM operations
function render() {
    // Clear existing content
    while (appEl.firstChild) {
        appEl.removeChild(appEl.firstChild);
    }
    
    if (!currentUser) {
        renderAuthPage();
    } else {
        renderApp();
    }
}

function renderAuthPage() {
    let isSignUp = false;
    
    const authPage = document.createElement('div');
    authPage.className = 'auth-page';
    
    authPage.innerHTML = `
        <div class="auth-container">
            <div class="auth-header">
                <h1>TeamFlow PM</h1>
                <p>A collaborative project management SaaS</p>
            </div>
            
            <div class="card">
                <div id="auth-form-container"></div>
                <div id="auth-message" class="mt-4"></div>
            </div>
        </div>
    `;
    
    appEl.appendChild(authPage);
    renderAuthForm();
    
    function renderAuthForm() {
        const container = document.getElementById('auth-form-container');
        const messageEl = document.getElementById('auth-message');
        
        container.innerHTML = `
            <form id="auth-form" class="auth-form">
                <div class="form-group">
                    <label for="email">Email</label>
                    <input type="email" id="email" required>
                </div>
                
                ${isSignUp ? `
                    <div class="form-group">
                        <label for="name">Full Name</label>
                        <input type="text" id="name" required>
                    </div>
                ` : ''}
                
                <div class="form-group">
                    <label for="password">Password</label>
                    <input type="password" id="password" required minlength="6">
                </div>
                
                <div class="auth-buttons">
                    <button type="submit" class="btn btn-primary">
                        ${isSignUp ? 'Sign Up' : 'Sign In'}
                    </button>
                    <button type="button" id="switch-auth" class="btn btn-secondary">
                        ${isSignUp ? 'Already have an account? Sign In' : 'Need an account? Sign Up'}
                    </button>
                </div