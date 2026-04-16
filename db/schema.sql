-- Users table
CREATE TABLE IF NOT EXISTS app_4994_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT NOT NULL,
  subscription_tier TEXT NOT NULL DEFAULT 'free',
  stripe_customer_id TEXT UNIQUE,
  email_verified BOOLEAN NOT NULL DEFAULT false,
  verification_token TEXT,
  reset_token TEXT,
  reset_token_expires TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_app_4994_users_email ON app_4994_users(email);
CREATE INDEX IF NOT EXISTS idx_app_4994_users_stripe_customer ON app_4994_users(stripe_customer_id);

-- Workspaces table
CREATE TABLE IF NOT EXISTS app_4994_workspaces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  created_by UUID NOT NULL REFERENCES app_4994_users(id) ON DELETE CASCADE,
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_app_4994_workspaces_created_by ON app_4994_workspaces(created_by);
CREATE INDEX IF NOT EXISTS idx_app_4994_workspaces_deleted_at ON app_4994_workspaces(deleted_at);

-- Workspace members table
CREATE TABLE IF NOT EXISTS app_4994_workspace_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES app_4994_workspaces(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES app_4994_users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member',
  invited_by UUID REFERENCES app_4994_users(id) ON DELETE SET NULL,
  invited_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  joined_at TIMESTAMPTZ,
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(workspace_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_app_4994_workspace_members_workspace_id ON app_4994_workspace_members(workspace_id);
CREATE INDEX IF NOT EXISTS idx_app_4994_workspace_members_user_id ON app_4994_workspace_members(user_id);
CREATE INDEX IF NOT EXISTS idx_app_4994_workspace_members_deleted_at ON app_4994_workspace_members(deleted_at);

-- Boards table
CREATE TABLE IF NOT EXISTS app_4994_boards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES app_4994_workspaces(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  position INTEGER NOT NULL DEFAULT 0,
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_app_4994_boards_workspace_id ON app_4994_boards(workspace_id);
CREATE INDEX IF NOT EXISTS idx_app_4994_boards_position ON app_4994_boards(position);
CREATE INDEX IF NOT EXISTS idx_app_4994_boards_deleted_at ON app_4994_boards(deleted_at);

-- Tasks table
CREATE TABLE IF NOT EXISTS app_4994_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  board_id UUID NOT NULL REFERENCES app_4994_boards(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  column TEXT NOT NULL DEFAULT 'todo',
  position INTEGER NOT NULL DEFAULT 0,
  assignee_id UUID REFERENCES app_4994_users(id) ON DELETE SET NULL,
  created_by UUID NOT NULL REFERENCES app_4994_users(id) ON DELETE CASCADE,
  due_date TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_app_4994_tasks_board_id ON app_4994_tasks(board_id);
CREATE INDEX IF NOT EXISTS idx_app_4994_tasks_assignee_id ON app_4994_tasks(assignee_id);
CREATE INDEX IF NOT EXISTS idx_app_4994_tasks_created_by ON app_4994_tasks(created_by);
CREATE INDEX IF NOT EXISTS idx_app_4994_tasks_column_position ON app_4994_tasks(column, position);
CREATE INDEX IF NOT EXISTS idx_app_4994_tasks_deleted_at ON app_4994_tasks(deleted_at);

-- Task comments table
CREATE TABLE IF NOT EXISTS app_4994_task_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES app_4994_tasks(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES app_4994_users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_app_4994_task_comments_task_id ON app_4994_task_comments(task_id);
CREATE INDEX IF NOT EXISTS idx_app_4994_task_comments_user_id ON app_4994_task_comments(user_id);
CREATE INDEX IF NOT EXISTS idx_app_4994_task_comments_deleted_at ON app_4994_task_comments(deleted_at);

-- Task attachments table
CREATE TABLE IF NOT EXISTS app_4994_task_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES app_4994_tasks(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES app_4994_users(id) ON DELETE CASCADE,
  filename TEXT NOT NULL,
  filepath TEXT NOT NULL,
  filesize INTEGER NOT NULL,
  mimetype TEXT NOT NULL,
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_app_4994_task_attachments_task_id ON app_4994_task_attachments(task_id);
CREATE INDEX IF NOT EXISTS idx_app_4994_task_attachments_user_id ON app_4994_task_attachments(user_id);
CREATE INDEX IF NOT EXISTS idx_app_4994_task_attachments_deleted_at ON app_4994_task_attachments(deleted_at);

-- Update triggers for updated_at columns
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

DO $$ 
BEGIN
  -- Drop existing triggers if they exist
  DROP TRIGGER IF EXISTS update_app_4994_users_updated_at ON app_4994_users;
  DROP TRIGGER IF EXISTS update_app_4994_workspaces_updated_at ON app_4994_workspaces;
  DROP TRIGGER IF EXISTS update_app_4994_workspace_members_updated_at ON app_4994_workspace_members;
  DROP TRIGGER IF EXISTS update_app_4994_boards_updated_at ON app_4994_boards;
  DROP TRIGGER IF EXISTS update_app_4994_tasks_updated_at ON app_4994_tasks;
  DROP TRIGGER IF EXISTS update_app_4994_task_comments_updated_at ON app_4994_task_comments;
  
  -- Create triggers for each table
  CREATE TRIGGER update_app_4994_users_updated_at
    BEFORE UPDATE ON app_4994_users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    
  CREATE TRIGGER update_app_4994_workspaces_updated_at
    BEFORE UPDATE ON app_4994_workspaces
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    
  CREATE TRIGGER update_app_4994_workspace_members_updated_at
    BEFORE UPDATE ON app_4994_workspace_members
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    
  CREATE TRIGGER update_app_4994_boards_updated_at
    BEFORE UPDATE ON app_4994_boards
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    
  CREATE TRIGGER update_app_4994_tasks_updated_at
    BEFORE UPDATE ON app_4994_tasks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    
  CREATE TRIGGER update_app_4994_task_comments_updated_at
    BEFORE UPDATE ON app_4994_task_comments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
END $$;