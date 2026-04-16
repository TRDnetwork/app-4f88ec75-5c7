require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const nodemailer = require('nodemailer');
const { body, validationResult } = require('express-validator');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Auth middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) return res.status(401).json({ error: 'Access token required' });
  
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid or expired token' });
    req.user = user;
    next();
  });
};

// Email transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

// Routes

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Auth routes
app.post('/api/auth/register', [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('name').trim().notEmpty()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password, name } = req.body;
  
  try {
    // Check if user exists
    const existingUser = await pool.query(
      'SELECT id FROM app_4994_users WHERE email = $1',
      [email]
    );
    
    if (existingUser.rows.length > 0) {
      return res.status(409).json({ error: 'User already exists' });
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create user
    const result = await pool.query(
      `INSERT INTO app_4994_users (email, password_hash, name, subscription_tier) 
       VALUES ($1, $2, $3, 'free') 
       RETURNING id, email, name, subscription_tier, created_at`,
      [email, hashedPassword, name]
    );
    
    const user = result.rows[0];
    
    // Generate JWT
    const token = jwt.sign(
      { id: user.id, email: user.email, tier: user.subscription_tier },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    // Send welcome email (in background)
    transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: email,
      subject: 'Welcome to TeamFlow PM!',
      html: `<h1>Welcome to TeamFlow PM, ${name}!</h1>
             <p>Your account has been created successfully.</p>
             <p>Start by creating your first workspace and inviting your team members.</p>`
    }).catch(console.error);
    
    res.status(201).json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        subscription_tier: user.subscription_tier
      },
      token
    });
    
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/auth/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password } = req.body;
  
  try {
    const result = await pool.query(
      'SELECT id, email, password_hash, name, subscription_tier FROM app_4994_users WHERE email = $1',
      [email]
    );
    
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const user = result.rows[0];
    const validPassword = await bcrypt.compare(password, user.password_hash);
    
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const token = jwt.sign(
      { id: user.id, email: user.email, tier: user.subscription_tier },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        subscription_tier: user.subscription_tier
      },
      token
    });
    
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Workspace routes
app.get('/api/workspaces', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT w.*, wm.role 
       FROM app_4994_workspaces w
       JOIN app_4994_workspace_members wm ON w.id = wm.workspace_id
       WHERE wm.user_id = $1 AND wm.deleted_at IS NULL
       ORDER BY w.created_at DESC`,
      [req.user.id]
    );
    
    res.json(result.rows);
  } catch (error) {
    console.error('Get workspaces error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/workspaces', authenticateToken, [
  body('name').trim().notEmpty(),
  body('description').optional().trim()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { name, description } = req.body;
  
  try {
    // Create workspace
    const workspaceResult = await pool.query(
      `INSERT INTO app_4994_workspaces (name, description, created_by) 
       VALUES ($1, $2, $3) 
       RETURNING *`,
      [name, description || null, req.user.id]
    );
    
    const workspace = workspaceResult.rows[0];
    
    // Add creator as admin member
    await pool.query(
      `INSERT INTO app_4994_workspace_members (workspace_id, user_id, role, invited_by) 
       VALUES ($1, $2, 'admin', $2)`,
      [workspace.id, req.user.id]
    );
    
    res.status(201).json(workspace);
  } catch (error) {
    console.error('Create workspace error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Task board routes
app.get('/api/workspaces/:workspaceId/boards', authenticateToken, async (req, res) => {
  const { workspaceId } = req.params;
  
  try {
    // Verify workspace access
    const memberCheck = await pool.query(
      'SELECT 1 FROM app_4994_workspace_members WHERE workspace_id = $1 AND user_id = $2 AND deleted_at IS NULL',
      [workspaceId, req.user.id]
    );
    
    if (memberCheck.rows.length === 0) {
      return res.status(403).json({ error: 'No access to this workspace' });
    }
    
    const result = await pool.query(
      `SELECT * FROM app_4994_boards 
       WHERE workspace_id = $1 AND deleted_at IS NULL
       ORDER BY position, created_at`,
      [workspaceId]
    );
    
    res.json(result.rows);
  } catch (error) {
    console.error('Get boards error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/workspaces/:workspaceId/boards', authenticateToken, [
  body('name').trim().notEmpty(),
  body('description').optional().trim()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { workspaceId } = req.params;
  const { name, description } = req.body;
  
  try {
    // Verify workspace access and admin role
    const memberCheck = await pool.query(
      `SELECT role FROM app_4994_workspace_members 
       WHERE workspace_id = $1 AND user_id = $2 AND deleted_at IS NULL`,
      [workspaceId, req.user.id]
    );
    
    if (memberCheck.rows.length === 0) {
      return res.status(403).json({ error: 'No access to this workspace' });
    }
    
    if (memberCheck.rows[0].role !== 'admin') {
      return res.status(403).json({ error: 'Admin role required' });
    }
    
    // Get max position
    const positionResult = await pool.query(
      'SELECT COALESCE(MAX(position), 0) + 1 as next_position FROM app_4994_boards WHERE workspace_id = $1',
      [workspaceId]
    );
    
    const result = await pool.query(
      `INSERT INTO app_4994_boards (workspace_id, name, description, position) 
       VALUES ($1, $2, $3, $4) 
       RETURNING *`,
      [workspaceId, name, description || null, positionResult.rows[0].next_position]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Create board error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Task routes
app.get('/api/boards/:boardId/tasks', authenticateToken, async (req, res) => {
  const { boardId } = req.params;
  
  try {
    // Verify board access through workspace membership
    const accessCheck = await pool.query(
      `SELECT 1 FROM app_4994_boards b
       JOIN app_4994_workspace_members wm ON b.workspace_id = wm.workspace_id
       WHERE b.id = $1 AND wm.user_id = $2 AND wm.deleted_at IS NULL AND b.deleted_at IS NULL`,
      [boardId, req.user.id]
    );
    
    if (accessCheck.rows.length === 0) {
      return res.status(403).json({ error: 'No access to this board' });
    }
    
    const result = await pool.query(
      `SELECT t.*, u.name as assignee_name, u.email as assignee_email
       FROM app_4994_tasks t
       LEFT JOIN app_4994_users u ON t.assignee_id = u.id
       WHERE t.board_id = $1 AND t.deleted_at IS NULL
       ORDER BY t.position, t.created_at`,
      [boardId]
    );
    
    res.json(result.rows);
  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/boards/:boardId/tasks', authenticateToken, [
  body('title').trim().notEmpty(),
  body('description').optional().trim(),
  body('column').isIn(['todo', 'in_progress', 'review', 'done']),
  body('assignee_id').optional().isUUID()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { boardId } = req.params;
  const { title, description, column, assignee_id } = req.body;
  
  try {
    // Verify board access through workspace membership
    const accessCheck = await pool.query(
      `SELECT 1 FROM app_4994_boards b
       JOIN app_4994_workspace_members wm ON b.workspace_id = wm.workspace_id
       WHERE b.id = $1 AND wm.user_id = $2 AND wm.deleted_at IS NULL AND b.deleted_at IS NULL`,
      [boardId, req.user.id]
    );
    
    if (accessCheck.rows.length === 0) {
      return res.status(403).json({ error: 'No access to this board' });
    }
    
    // Get max position in column
    const positionResult = await pool.query(
      'SELECT COALESCE(MAX(position), 0) + 1 as next_position FROM app_4994_tasks WHERE board_id = $1 AND column = $2',
      [boardId, column]
    );
    
    const result = await pool.query(
      `INSERT INTO app_4994_tasks (board_id, title, description, column, position, assignee_id, created_by) 
       VALUES ($1, $2, $3, $4, $5, $6, $7) 
       RETURNING *`,
      [boardId, title, description || null, column, positionResult.rows[0].next_position, assignee_id || null, req.user.id]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.patch('/api/tasks/:taskId', authenticateToken, [
  body('title').optional().trim().notEmpty(),
  body('description').optional().trim(),
  body('column').optional().isIn(['todo', 'in_progress', 'review', 'done']),
  body('assignee_id').optional().isUUID(),
  body('position').optional().isInt()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { taskId } = req.params;
  const updates = req.body;
  
  try {
    // Verify task access through workspace membership
    const accessCheck = await pool.query(
      `SELECT 1 FROM app_4994_tasks t
       JOIN app_4994_boards b ON t.board_id = b.id
       JOIN app_4994_workspace_members wm ON b.workspace_id = wm.workspace_id
       WHERE t.id = $1 AND wm.user_id = $2 AND wm.deleted_at IS NULL AND t.deleted_at IS NULL`,
      [taskId, req.user.id]
    );
    
    if (accessCheck.rows.length === 0) {
      return res.status(403).json({ error: 'No access to this task' });
    }
    
    // Build dynamic update query
    const setClauses = [];
    const values = [];
    let paramCount = 1;
    
    if (updates.title !== undefined) {
      setClauses.push(`title = $${paramCount++}`);
      values.push(updates.title);
    }
    if (updates.description !== undefined) {
      setClauses.push(`description = $${paramCount++}`);
      values.push(updates.description);
    }
    if (updates.column !== undefined) {
      setClauses.push(`column = $${paramCount++}`);
      values.push(updates.column);
    }
    if (updates.assignee_id !== undefined) {
      setClauses.push(`assignee_id = $${paramCount++}`);
      values.push(updates.assignee_id);
    }
    if (updates.position !== undefined) {
      setClauses.push(`position = $${paramCount++}`);
      values.push(updates.position);
    }
    
    if (setClauses.length === 0) {
      return res.status(400).json({ error: 'No updates provided' });
    }
    
    setClauses.push(`updated_at = NOW()`);
    values.push(taskId);
    
    const result = await pool.query(
      `UPDATE app_4994_tasks 
       SET ${setClauses.join(', ')} 
       WHERE id = $${paramCount} 
       RETURNING *`,
      values
    );
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update task error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Stripe routes
app.post('/api/stripe/create-checkout-session', authenticateToken, async (req, res) => {
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price: process.env.STRIPE_PRO_PRICE_ID,
        quantity: 1,
      }],
      mode: 'subscription',
      success_url: `${process.env.FRONTEND_URL}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/pricing`,
      client_reference_id: req.user.id,
      metadata: {
        user_id: req.user.id
      }
    });
    
    res.json({ sessionId: session.id, url: session.url });
  } catch (error) {
    console.error('Stripe checkout error:', error);
    res.status(500).json({ error: 'Failed to create checkout session' });
  }
});

// Webhook handler for Stripe events
app.post('/api/stripe/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;
  
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }
  
  try {
    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object;
        const userId = session.client_reference_id;
        
        await pool.query(
          'UPDATE app_4994_users SET subscription_tier = $1, stripe_customer_id = $2 WHERE id = $3',
          ['pro', session.customer, userId]
        );
        break;
        
      case 'customer.subscription.deleted':
        const subscription = event.data.object;
        
        await pool.query(
          'UPDATE app_4994_users SET subscription_tier = $1 WHERE stripe_customer_id = $2',
          ['free', subscription.customer]
        );
        break;
    }
    
    res.json({ received: true });
  } catch (error) {
    console.error('Webhook processing error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});