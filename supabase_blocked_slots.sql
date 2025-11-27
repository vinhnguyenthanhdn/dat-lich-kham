-- Create blocked_slots table to manage blocked time slots on specific dates
CREATE TABLE IF NOT EXISTS blocked_slots (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  blocked_date DATE NOT NULL,
  blocked_time TIME NOT NULL,
  reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  UNIQUE(blocked_date, blocked_time)
);

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_blocked_slots_date ON blocked_slots(blocked_date);

-- Add comment
COMMENT ON TABLE blocked_slots IS 'Stores blocked/unavailable time slots for specific dates';
COMMENT ON COLUMN blocked_slots.blocked_date IS 'The date when the time slot is blocked';
COMMENT ON COLUMN blocked_slots.blocked_time IS 'The time of the blocked slot (e.g., 08:30, 15:00)';
COMMENT ON COLUMN blocked_slots.reason IS 'Optional reason for blocking the slot';

-- Enable Row Level Security
ALTER TABLE blocked_slots ENABLE ROW LEVEL SECURITY;

-- Create policy to allow public read access (for booking page to check blocked slots)
CREATE POLICY "Allow public read access to blocked_slots"
  ON blocked_slots
  FOR SELECT
  USING (true);

-- Create policy to allow insert/update/delete (you can restrict this to admin users if needed)
CREATE POLICY "Allow all operations on blocked_slots"
  ON blocked_slots
  FOR ALL
  USING (true);
