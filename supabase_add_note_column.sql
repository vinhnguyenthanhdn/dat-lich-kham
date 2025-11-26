-- Add note column to appointments table
-- Run this SQL in Supabase SQL Editor

ALTER TABLE appointments
ADD COLUMN IF NOT EXISTS note TEXT DEFAULT NULL;

-- Add comment to explain the column
COMMENT ON COLUMN appointments.note IS 'Doctor notes for this appointment (admin only)';

-- Verify the column was added
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'appointments' AND column_name = 'note';
