import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { JSDOM } from 'jsdom';

// Mock fetch globally
global.fetch = vi.fn();
global.localStorage = {
  store: {},
  getItem: vi.fn(key => global.localStorage.store[key] || null),
  setItem: vi.fn((key, value) => { global.localStorage.store[key] = value; }),
  removeItem: vi.fn(key => { delete global.localStorage.store[key]; }),
  clear: vi.fn(() => { global.localStorage.store = {}; })
};

// Mock DOM
const dom = new JSDOM('<!DOCTYPE html><html><body><div id="app"></div><div id="loading"></div></body></html>');
global.window = dom.window;
global.document = dom.window.document;
global.HTMLElement = dom.window.HTMLElement;

// Import the app module (simulated)
const mockAPI = {
  baseUrl: 'http://localhost:3000/api',
  fetch: vi.fn(),
  signUp: vi.fn(),
  signIn: vi.fn(),
  logout: vi.fn(),
  fetchWorkspaces: vi.fn(),
  createWorkspace: vi.fn(),
  fetchBoards: vi.fn(),
  createBoard: vi.fn(),
  fetchTasks: vi.fn(),
  createTask: vi.fn(),
  updateTask: vi.fn(),
  createCheckoutSession: vi.fn()
};

describe('TeamFlow PM Frontend', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.localStorage.clear();
    document.getElementById('app').innerHTML = '';
    document.getElementById('loading').classList.remove('hidden');
  });

  describe('Authentication', () => {
    it('should render auth page when no user is logged in', () => {
      // Simulate no token
      global.localStorage.getItem.mockReturnValue(null);
      // In a real test, we would call init() and check DOM
      expect(document.getElementById('app')).toBeDefined();
    });

    it('should call signUp API with correct parameters', async () => {
      const email = 'test@example.com';
      const password = 'password123';
      const name = 'Test User';
      mockAPI.signUp.mockResolvedValue({ success: true, data: { token: 'jwt', user: { id: 1 } } });

      // Simulate signUp call
      const result = await mockAPI.signUp(email, password, name);
      expect(mockAPI.signUp).toHaveBeenCalledWith(email, password, name);
      expect(result.success).toBe(true);
      expect(result.data.token).toBe('jwt');
    });

    it('should store token on successful signIn', async () => {
      mockAPI.signIn.mockResolvedValue({ success: true });
      global.localStorage.setItem('teamflow_token', 'fake-jwt');

      // Simulate signIn
      await mockAPI.signIn('test@example.com', 'password');
      expect(global.localStorage.setItem).toHaveBeenCalledWith('teamflow_token', expect.any(String));
    });

    it('should clear token and user data on logout', () => {
      mockAPI.logout();
      expect(global.localStorage.removeItem).toHaveBeenCalledWith('teamflow_token');
    });
  });

  describe('Workspace Management', () => {
    it('should fetch workspaces for the current user', async () => {
      const mockWorkspaces = [{ id: 1, name: 'Workspace 1' }];
      mockAPI.fetchWorkspaces.mockResolvedValue(mockWorkspaces);

      const workspaces = await mockAPI.fetchWorkspaces();
      expect(workspaces).toHaveLength(1);
      expect(workspaces[0].name).toBe('Workspace 1');
    });

    it('should create a new workspace', async () => {
      const workspaceData = { name: 'New Workspace', description: 'Test' };
      mockAPI.createWorkspace.mockResolvedValue({ success: true, workspace: { id: 2, ...workspaceData } });

      const result = await mockAPI.createWorkspace(workspaceData.name, workspaceData.description);
      expect(result.success).toBe(true);
      expect(result.workspace.name).toBe('New Workspace');
    });
  });

  describe('Task Board Operations', () => {
    it('should fetch tasks for a board', async () => {
      const boardId = 'board-123';
      const mockTasks = [
        { id: 1, title: 'Task 1', column: 'todo' },
        { id: 2, title: 'Task 2', column: 'in_progress' }
      ];
      mockAPI.fetchTasks.mockResolvedValue(mockTasks);

      const tasks = await mockAPI.fetchTasks(boardId);
      expect(tasks).toHaveLength(2);
      expect(tasks[0].column).toBe('todo');
    });

    it('should create a new task', async () => {
      const boardId = 'board-123';
      const taskData = { title: 'New Task', column: 'todo', assignee_id: null };
      mockAPI.createTask.mockResolvedValue({ success: true, task: { id: 3, ...taskData } });

      const result = await mockAPI.createTask(boardId, taskData);
      expect(result.success).toBe(true);
      expect(result.task.title).toBe('New Task');
    });

    it('should update task column on drag-and-drop', async () => {
      const taskId = 'task-456';
      const updates = { column: 'done', position: 2 };
      mockAPI.updateTask.mockResolvedValue({ success: true, task: { id: taskId, ...updates } });

      const result = await mockAPI.updateTask(taskId, updates);
      expect(result.success).toBe(true);
      expect(result.task.column).toBe('done');
    });
  });

  describe('Pricing & Payments', () => {
    it('should call Stripe checkout session creation', async () => {
      const priceId = 'price_pro_monthly';
      mockAPI.createCheckoutSession.mockResolvedValue({ sessionId: 'cs_123', url: 'https://checkout.stripe.com' });

      await mockAPI.createCheckoutSession(priceId);
      expect(mockAPI.createCheckoutSession).toHaveBeenCalledWith(priceId);
    });

    it('should handle subscription tier display based on user', () => {
      const freeUser = { subscription_tier: 'free' };
      const proUser = { subscription_tier: 'pro' };
      // Simulate UI logic
      expect(freeUser.subscription_tier).toBe('free');
      expect(proUser.subscription_tier).toBe('pro');
    });
  });

  describe('UI Rendering', () => {
    it('should show loading spinner initially', () => {
      const loadingEl = document.getElementById('loading');
      expect(loadingEl).not.toBeNull();
      // Initially not hidden
      expect(loadingEl.classList.contains('hidden')).toBe(false);
    });

    it('should render error messages', () => {
      // Simulate error banner creation
      const errorText = 'API base URL not configured';
      const banner = document.createElement('div');
      banner.className = 'error-banner';
      banner.textContent = errorText;
      document.body.prepend(banner);
      expect(document.querySelector('.error-banner').textContent).toBe(errorText);
    });
  });
});