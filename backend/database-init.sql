-- ANT Support Database Schema
-- Initialize database tables for the TV diagnostics platform

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Devices table - TV set-top boxes
CREATE TABLE IF NOT EXISTS devices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    brand VARCHAR(255) NOT NULL,
    model VARCHAR(255),
    description TEXT,
    color VARCHAR(100) DEFAULT 'from-blue-500 to-blue-600',
    order_index INTEGER NOT NULL DEFAULT 0,
    status VARCHAR(50) DEFAULT 'active',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Problems table - diagnostic issues
CREATE TABLE IF NOT EXISTS problems (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    device_id UUID REFERENCES devices(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100) DEFAULT 'other',
    icon VARCHAR(100) DEFAULT 'HelpCircle',
    color VARCHAR(100) DEFAULT 'from-blue-500 to-blue-600',
    tags TEXT[], -- Array of tags
    priority INTEGER DEFAULT 1,
    estimated_time INTEGER DEFAULT 5, -- in minutes
    difficulty VARCHAR(50) DEFAULT 'beginner',
    success_rate DECIMAL(5,2) DEFAULT 0,
    completed_count INTEGER DEFAULT 0,
    status VARCHAR(50) DEFAULT 'draft',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Diagnostic steps table
CREATE TABLE IF NOT EXISTS diagnostic_steps (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    problem_id UUID REFERENCES problems(id) ON DELETE CASCADE,
    device_id UUID REFERENCES devices(id) ON DELETE CASCADE,
    step_number INTEGER NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    instruction TEXT,
    estimated_time INTEGER DEFAULT 30, -- in seconds
    media_url TEXT,
    media_type VARCHAR(50),
    remote_id UUID, -- Reference to remote control layout
    button_sequence TEXT[], -- Array of button names
    expected_result TEXT,
    troubleshooting_tips TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Diagnostic sessions table
CREATE TABLE IF NOT EXISTS diagnostic_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id VARCHAR(255) UNIQUE NOT NULL,
    device_id UUID REFERENCES devices(id),
    problem_id UUID REFERENCES problems(id),
    start_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    end_time TIMESTAMP WITH TIME ZONE,
    completed_steps INTEGER DEFAULT 0,
    total_steps INTEGER DEFAULT 0,
    current_step_id UUID REFERENCES diagnostic_steps(id),
    success BOOLEAN DEFAULT false,
    duration INTEGER DEFAULT 0, -- in seconds
    error_steps UUID[], -- Array of step IDs where errors occurred
    user_agent TEXT,
    ip_address INET,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Remote controls table (for TV interface layouts)
CREATE TABLE IF NOT EXISTS remotes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    manufacturer VARCHAR(255),
    model VARCHAR(255),
    description TEXT,
    device_id UUID REFERENCES devices(id),
    layout VARCHAR(50) DEFAULT 'standard',
    color_scheme VARCHAR(50) DEFAULT 'dark',
    dimensions JSONB, -- {width: 200, height: 500}
    buttons JSONB, -- Array of button definitions
    zones JSONB, -- Array of zone definitions
    is_default BOOLEAN DEFAULT false,
    usage_count INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- TV interfaces table
CREATE TABLE IF NOT EXISTS tv_interfaces (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    device_id UUID REFERENCES devices(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    interface_data JSONB NOT NULL, -- The actual interface layout
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_devices_active ON devices(is_active);
CREATE INDEX IF NOT EXISTS idx_devices_order ON devices(order_index);
CREATE INDEX IF NOT EXISTS idx_problems_device ON problems(device_id);
CREATE INDEX IF NOT EXISTS idx_problems_active ON problems(is_active);
CREATE INDEX IF NOT EXISTS idx_steps_problem ON diagnostic_steps(problem_id);
CREATE INDEX IF NOT EXISTS idx_steps_device ON diagnostic_steps(device_id);
CREATE INDEX IF NOT EXISTS idx_steps_number ON diagnostic_steps(step_number);
CREATE INDEX IF NOT EXISTS idx_sessions_device ON diagnostic_sessions(device_id);
CREATE INDEX IF NOT EXISTS idx_sessions_problem ON diagnostic_sessions(problem_id);
CREATE INDEX IF NOT EXISTS idx_sessions_active ON diagnostic_sessions(is_active);
CREATE INDEX IF NOT EXISTS idx_remotes_device ON remotes(device_id);
CREATE INDEX IF NOT EXISTS idx_tv_interfaces_device ON tv_interfaces(device_id);

-- Insert some sample data
INSERT INTO devices (id, name, brand, model, description, color, order_index) VALUES
    ('550e8400-e29b-41d4-a716-446655440001', 'OpenBox', 'OpenBox', 'Standard', 'Стандартные приставки OpenBox для цифрового телевидения', 'from-blue-500 to-blue-600', 1),
    ('550e8400-e29b-41d4-a716-446655440002', 'UCLAN', 'UCLAN', 'HD Series', 'Высококачественные HD приставки UCLAN', 'from-green-500 to-green-600', 2),
    ('550e8400-e29b-41d4-a716-446655440003', 'HDBox', 'HDBox', 'Pro', 'Профессиональные приставки HDBox', 'from-purple-500 to-purple-600', 3),
    ('550e8400-e29b-41d4-a716-446655440004', 'OpenBox Gold', 'OpenBox', 'Gold Edition', 'Премиум приставки OpenBox Gold с расширенными возможностями', 'from-yellow-500 to-yellow-600', 4)
ON CONFLICT (id) DO NOTHING;

-- Insert sample problems
INSERT INTO problems (id, device_id, title, description, category, priority, estimated_time, difficulty) VALUES
    ('660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', 'Нет сигнала', 'Отсутствует сигнал на экране телевизора', 'signal', 1, 10, 'beginner'),
    ('660e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440001', 'Плохое качество изображения', 'Изображение размыто или с помехами', 'video', 2, 15, 'intermediate'),
    ('660e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440002', 'Нет звука', 'Отсутствует звук при наличии изображения', 'audio', 1, 8, 'beginner'),
    ('660e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440003', 'Приставка не включается', 'Устройство не реагирует на включение', 'power', 1, 12, 'beginner')
ON CONFLICT (id) DO NOTHING;

-- Insert sample diagnostic steps
INSERT INTO diagnostic_steps (id, problem_id, device_id, step_number, title, description, instruction, estimated_time) VALUES
    ('770e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', 1, 'Проверьте кабели', 'Убедитесь, что все кабели подключены правильно', 'Проверьте HDMI/AV кабели между приставкой и телевизором', 60),
    ('770e8400-e29b-41d4-a716-446655440002', '660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', 2, 'Проверьте антенну', 'Убедитесь, что антенный кабель подключен', 'Проверьте подключение антенного кабеля к приставке', 45),
    ('770e8400-e29b-41d4-a716-446655440003', '660e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440001', 1, 'Настройте разрешение', 'Измените настройки разрешения экрана', 'Войдите в меню настроек и выберите подходящее ��азрешение', 90),
    ('770e8400-e29b-41d4-a716-446655440004', '660e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440002', 1, 'Проверьте аудио кабели', 'Убедитесь в правильности аудио подключения', 'Проверьте аудио выходы приставки и входы телевизора/аудиосистемы', 60)
ON CONFLICT (id) DO NOTHING;

-- Update updated_at timestamp function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_devices_updated_at BEFORE UPDATE ON devices
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_problems_updated_at BEFORE UPDATE ON problems
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_diagnostic_steps_updated_at BEFORE UPDATE ON diagnostic_steps
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_diagnostic_sessions_updated_at BEFORE UPDATE ON diagnostic_sessions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_remotes_updated_at BEFORE UPDATE ON remotes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tv_interfaces_updated_at BEFORE UPDATE ON tv_interfaces
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
