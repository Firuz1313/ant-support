-- ANT Support Database Schema
-- Full migration with all tables and relationships

-- Create extension for UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table for authentication and role management
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(255),
    last_name VARCHAR(255),
    role VARCHAR(50) DEFAULT 'user' CHECK (role IN ('admin', 'technician', 'user')),
    is_active BOOLEAN DEFAULT true,
    last_login TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Devices table - TV set-top boxes
CREATE TABLE IF NOT EXISTS devices (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    brand VARCHAR(255) NOT NULL,
    model VARCHAR(255) NOT NULL,
    type VARCHAR(100) DEFAULT 'set_top_box',
    description TEXT,
    color VARCHAR(255),
    image_url TEXT,
    order_index INTEGER DEFAULT 0,
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'discontinued')),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Problems table - diagnostic problems
CREATE TABLE IF NOT EXISTS problems (
    id SERIAL PRIMARY KEY,
    device_id VARCHAR(255) REFERENCES devices(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    severity VARCHAR(50) DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    category VARCHAR(100) DEFAULT 'other',
    icon VARCHAR(100) DEFAULT 'HelpCircle',
    color VARCHAR(255),
    tags TEXT[], -- PostgreSQL array type
    priority INTEGER DEFAULT 1,
    estimated_time INTEGER DEFAULT 5, -- in minutes
    difficulty VARCHAR(50) DEFAULT 'beginner' CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
    success_rate DECIMAL(5,2) DEFAULT 0,
    completed_count INTEGER DEFAULT 0,
    status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Remote controls table (create before diagnostic_steps for FK reference)
CREATE TABLE IF NOT EXISTS remotes (
    id VARCHAR(255) PRIMARY KEY,
    device_id VARCHAR(255) REFERENCES devices(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    manufacturer VARCHAR(255),
    model VARCHAR(255),
    description TEXT,
    layout VARCHAR(100) DEFAULT 'standard',
    color_scheme VARCHAR(50) DEFAULT 'dark',
    dimensions JSONB, -- {width, height}
    buttons JSONB DEFAULT '[]', -- Array of button objects
    zones JSONB DEFAULT '[]', -- Array of zone objects
    is_default BOOLEAN DEFAULT false,
    usage_count INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- TV interfaces table - screenshots and interface layouts (create before diagnostic_steps)
CREATE TABLE IF NOT EXISTS tv_interfaces (
    id VARCHAR(255) PRIMARY KEY,
    device_id VARCHAR(255) REFERENCES devices(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    type VARCHAR(100) DEFAULT 'home' CHECK (type IN ('home', 'settings', 'guide', 'custom')),
    screenshot_url TEXT,
    screenshot_data TEXT, -- Base64 encoded image data
    clickable_areas JSONB DEFAULT '[]', -- Array of clickable areas
    highlight_areas JSONB DEFAULT '[]', -- Array of highlight areas
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- Diagnostic steps table
CREATE TABLE IF NOT EXISTS diagnostic_steps (
    id VARCHAR(255) PRIMARY KEY,
    problem_id INTEGER REFERENCES problems(id) ON DELETE CASCADE,
    device_id VARCHAR(255) REFERENCES devices(id) ON DELETE CASCADE,
    step_number INTEGER NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    instruction TEXT NOT NULL,
    expected_result TEXT,
    estimated_time INTEGER DEFAULT 30, -- in seconds
    step_type VARCHAR(50) DEFAULT 'action' CHECK (step_type IN ('action', 'check', 'info', 'warning')),
    remote_id VARCHAR(255) REFERENCES remotes(id) ON DELETE SET NULL,
    tv_interface_id VARCHAR(255) REFERENCES tv_interfaces(id) ON DELETE SET NULL,
    media_url TEXT, -- images, videos for this step
    is_optional BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(problem_id, step_number)
);


-- TV interface marks/annotations
CREATE TABLE IF NOT EXISTS tv_interface_marks (
    id VARCHAR(255) PRIMARY KEY,
    tv_interface_id VARCHAR(255) REFERENCES tv_interfaces(id) ON DELETE CASCADE,
    step_id VARCHAR(255) REFERENCES diagnostic_steps(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    mark_type VARCHAR(50) DEFAULT 'point' CHECK (mark_type IN ('point', 'area', 'arrow', 'highlight')),
    shape VARCHAR(50) DEFAULT 'circle' CHECK (shape IN ('circle', 'rectangle', 'polygon', 'arrow')),
    position JSONB NOT NULL, -- {x, y} coordinates
    size JSONB, -- {width, height} for areas
    color VARCHAR(50) DEFAULT '#3b82f6',
    border_color VARCHAR(50),
    border_width INTEGER DEFAULT 2,
    opacity DECIMAL(3,2) DEFAULT 0.8,
    is_clickable BOOLEAN DEFAULT false,
    is_highlightable BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    is_visible BOOLEAN DEFAULT true,
    display_order INTEGER DEFAULT 0,
    priority VARCHAR(50) DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Diagnostic sessions table - track user sessions
CREATE TABLE IF NOT EXISTS diagnostic_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    device_id VARCHAR(255) REFERENCES devices(id) ON DELETE SET NULL,
    problem_id INTEGER REFERENCES problems(id) ON DELETE SET NULL,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    user_name VARCHAR(255), -- For anonymous users
    session_token VARCHAR(255),
    start_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    end_time TIMESTAMP WITH TIME ZONE,
    current_step_id VARCHAR(255),
    completed_steps INTEGER DEFAULT 0,
    total_steps INTEGER DEFAULT 0,
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'failed', 'abandoned')),
    success BOOLEAN DEFAULT false,
    duration INTEGER, -- in seconds
    error_steps TEXT[], -- Array of step IDs where errors occurred
    notes TEXT,
    metadata JSONB, -- Additional session data
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Session steps - track individual step completions
CREATE TABLE IF NOT EXISTS session_steps (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID REFERENCES diagnostic_sessions(id) ON DELETE CASCADE,
    step_id VARCHAR(255) REFERENCES diagnostic_steps(id) ON DELETE CASCADE,
    step_number INTEGER NOT NULL,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    duration INTEGER, -- in seconds
    result VARCHAR(50) CHECK (result IN ('success', 'failure', 'skipped', 'pending')),
    notes TEXT,
    error_message TEXT,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step actions table - predefined actions for steps
CREATE TABLE IF NOT EXISTS step_actions (
    id VARCHAR(255) PRIMARY KEY,
    step_id VARCHAR(255) REFERENCES diagnostic_steps(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    action_type VARCHAR(100) NOT NULL, -- 'button_press', 'wait', 'check', etc.
    action_data JSONB, -- Specific data for the action
    order_index INTEGER DEFAULT 0,
    is_required BOOLEAN DEFAULT true,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Change logs table - audit trail
CREATE TABLE IF NOT EXISTS change_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    entity_type VARCHAR(100) NOT NULL,
    entity_id VARCHAR(255) NOT NULL,
    action VARCHAR(50) NOT NULL CHECK (action IN ('create', 'update', 'delete', 'archive')),
    changes JSONB, -- Old and new values
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    user_name VARCHAR(255),
    user_role VARCHAR(50),
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Site settings table
CREATE TABLE IF NOT EXISTS site_settings (
    id VARCHAR(255) PRIMARY KEY DEFAULT 'settings',
    site_name VARCHAR(255) DEFAULT 'ANT Support',
    site_description TEXT,
    default_language VARCHAR(10) DEFAULT 'ru',
    supported_languages TEXT[] DEFAULT ARRAY['ru', 'tj', 'uz'],
    theme VARCHAR(50) DEFAULT 'professional',
    primary_color VARCHAR(50) DEFAULT '#3b82f6',
    accent_color VARCHAR(50) DEFAULT '#10b981',
    enable_analytics BOOLEAN DEFAULT true,
    enable_feedback BOOLEAN DEFAULT true,
    enable_offline_mode BOOLEAN DEFAULT false,
    enable_notifications BOOLEAN DEFAULT true,
    max_steps_per_problem INTEGER DEFAULT 20,
    max_media_size INTEGER DEFAULT 10, -- MB
    session_timeout INTEGER DEFAULT 30, -- minutes
    api_settings JSONB,
    email_settings JSONB,
    storage_settings JSONB,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_devices_brand ON devices(brand);
CREATE INDEX IF NOT EXISTS idx_devices_status ON devices(status);
CREATE INDEX IF NOT EXISTS idx_devices_active ON devices(is_active);

CREATE INDEX IF NOT EXISTS idx_problems_device_id ON problems(device_id);
CREATE INDEX IF NOT EXISTS idx_problems_category ON problems(category);
CREATE INDEX IF NOT EXISTS idx_problems_status ON problems(status);
CREATE INDEX IF NOT EXISTS idx_problems_active ON problems(is_active);

CREATE INDEX IF NOT EXISTS idx_diagnostic_steps_problem_id ON diagnostic_steps(problem_id);
CREATE INDEX IF NOT EXISTS idx_diagnostic_steps_device_id ON diagnostic_steps(device_id);
CREATE INDEX IF NOT EXISTS idx_diagnostic_steps_step_number ON diagnostic_steps(step_number);
CREATE INDEX IF NOT EXISTS idx_diagnostic_steps_active ON diagnostic_steps(is_active);

CREATE INDEX IF NOT EXISTS idx_tv_interfaces_device_id ON tv_interfaces(device_id);
CREATE INDEX IF NOT EXISTS idx_tv_interfaces_type ON tv_interfaces(type);
CREATE INDEX IF NOT EXISTS idx_tv_interfaces_active ON tv_interfaces(is_active);

CREATE INDEX IF NOT EXISTS idx_tv_interface_marks_interface_id ON tv_interface_marks(tv_interface_id);
CREATE INDEX IF NOT EXISTS idx_tv_interface_marks_step_id ON tv_interface_marks(step_id);
CREATE INDEX IF NOT EXISTS idx_tv_interface_marks_active ON tv_interface_marks(is_active);

CREATE INDEX IF NOT EXISTS idx_remotes_device_id ON remotes(device_id);
CREATE INDEX IF NOT EXISTS idx_remotes_default ON remotes(is_default);
CREATE INDEX IF NOT EXISTS idx_remotes_active ON remotes(is_active);

CREATE INDEX IF NOT EXISTS idx_diagnostic_sessions_device_id ON diagnostic_sessions(device_id);
CREATE INDEX IF NOT EXISTS idx_diagnostic_sessions_problem_id ON diagnostic_sessions(problem_id);
CREATE INDEX IF NOT EXISTS idx_diagnostic_sessions_user_id ON diagnostic_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_diagnostic_sessions_status ON diagnostic_sessions(status);
CREATE INDEX IF NOT EXISTS idx_diagnostic_sessions_start_time ON diagnostic_sessions(start_time);

CREATE INDEX IF NOT EXISTS idx_session_steps_session_id ON session_steps(session_id);
CREATE INDEX IF NOT EXISTS idx_session_steps_step_id ON session_steps(step_id);

CREATE INDEX IF NOT EXISTS idx_step_actions_step_id ON step_actions(step_id);
CREATE INDEX IF NOT EXISTS idx_step_actions_active ON step_actions(is_active);

CREATE INDEX IF NOT EXISTS idx_change_logs_entity ON change_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_change_logs_action ON change_logs(action);
CREATE INDEX IF NOT EXISTS idx_change_logs_user_id ON change_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_change_logs_created_at ON change_logs(created_at);

-- Create full text search indexes for better search performance
CREATE INDEX IF NOT EXISTS idx_devices_search ON devices USING gin(to_tsvector('russian', name || ' ' || brand || ' ' || COALESCE(description, '')));
CREATE INDEX IF NOT EXISTS idx_problems_search ON problems USING gin(to_tsvector('russian', title || ' ' || COALESCE(description, '')));
CREATE INDEX IF NOT EXISTS idx_diagnostic_steps_search ON diagnostic_steps USING gin(to_tsvector('russian', title || ' ' || COALESCE(description, '') || ' ' || instruction));

-- Add triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers to all relevant tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_devices_updated_at BEFORE UPDATE ON devices FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_problems_updated_at BEFORE UPDATE ON problems FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_diagnostic_steps_updated_at BEFORE UPDATE ON diagnostic_steps FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_remotes_updated_at BEFORE UPDATE ON remotes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tv_interfaces_updated_at BEFORE UPDATE ON tv_interfaces FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tv_interface_marks_updated_at BEFORE UPDATE ON tv_interface_marks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_diagnostic_sessions_updated_at BEFORE UPDATE ON diagnostic_sessions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_session_steps_updated_at BEFORE UPDATE ON session_steps FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_step_actions_updated_at BEFORE UPDATE ON step_actions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_site_settings_updated_at BEFORE UPDATE ON site_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default admin user
INSERT INTO users (username, email, password_hash, first_name, last_name, role)
VALUES (
    'admin',
    'admin@ant-support.com',
    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewWCNXMLCiYGKg0G', -- password: admin123
    'System',
    'Administrator',
    'admin'
) ON CONFLICT (username) DO NOTHING;

-- Insert default site settings
INSERT INTO site_settings DEFAULT VALUES ON CONFLICT (id) DO NOTHING;

-- Insert sample devices (from mock data)
INSERT INTO devices (id, name, brand, model, type, description, color, is_active) VALUES
('openbox', 'OpenBox', 'OpenBox', 'Standard', 'set_top_box', 'Стандартные приставки OpenBox для цифрового телевидения', 'from-blue-500 to-blue-600', true),
('uclan', 'UCLAN', 'UCLAN', 'HD Series', 'set_top_box', 'Высококачественные HD приставки UCLAN', 'from-green-500 to-green-600', true),
('hdbox', 'HDBox', 'HDBox', 'Pro', 'set_top_box', 'Профессиональные приставки HDBox', 'from-purple-500 to-purple-600', true),
('openbox_gold', 'OpenBox Gold', 'OpenBox', 'Gold Edition', 'set_top_box', 'Премиум приставки OpenBox Gold с расширенными возможностями', 'from-yellow-500 to-yellow-600', true),
('skyway', 'SkyWay Light', 'SkyWay', 'Light', 'set_top_box', 'Компактные приставки SkyWay Light', 'from-orange-500 to-orange-600', true)
ON CONFLICT (id) DO NOTHING;
