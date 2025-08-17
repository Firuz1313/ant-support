-- Migration to add foreign key constraints for data integrity
-- This ensures referential integrity between related entities

-- Add foreign key constraints
ALTER TABLE problems 
ADD CONSTRAINT fk_problems_device_id 
FOREIGN KEY (device_id) REFERENCES devices(id) ON DELETE CASCADE;

ALTER TABLE diagnostic_steps 
ADD CONSTRAINT fk_steps_problem_id 
FOREIGN KEY (problem_id) REFERENCES problems(id) ON DELETE CASCADE;

ALTER TABLE diagnostic_steps 
ADD CONSTRAINT fk_steps_device_id 
FOREIGN KEY (device_id) REFERENCES devices(id) ON DELETE CASCADE;

ALTER TABLE diagnostic_sessions 
ADD CONSTRAINT fk_sessions_device_id 
FOREIGN KEY (device_id) REFERENCES devices(id) ON DELETE CASCADE;

ALTER TABLE diagnostic_sessions 
ADD CONSTRAINT fk_sessions_problem_id 
FOREIGN KEY (problem_id) REFERENCES problems(id) ON DELETE CASCADE;

-- Add indexes for better performance on foreign key lookups
CREATE INDEX IF NOT EXISTS idx_problems_device_id ON problems(device_id);
CREATE INDEX IF NOT EXISTS idx_steps_problem_id ON diagnostic_steps(problem_id);
CREATE INDEX IF NOT EXISTS idx_steps_device_id ON diagnostic_steps(device_id);
CREATE INDEX IF NOT EXISTS idx_sessions_device_id ON diagnostic_sessions(device_id);
CREATE INDEX IF NOT EXISTS idx_sessions_problem_id ON diagnostic_sessions(problem_id);

-- Add indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_problems_status ON problems(status);
CREATE INDEX IF NOT EXISTS idx_problems_is_active ON problems(is_active);
CREATE INDEX IF NOT EXISTS idx_steps_step_number ON diagnostic_steps(step_number);
CREATE INDEX IF NOT EXISTS idx_sessions_start_time ON diagnostic_sessions(start_time);
