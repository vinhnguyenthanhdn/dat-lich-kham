-- ============================================
-- SUPABASE SETUP FOR ADMIN DASHBOARD
-- ============================================
-- Run this SQL in Supabase SQL Editor after creating the appointments table

-- 1. Enable Row Level Security (if not already enabled)
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

-- 2. Drop existing policies (if any)
DROP POLICY IF EXISTS "Enable insert for anon users" ON appointments;
DROP POLICY IF EXISTS "Enable read for all users" ON appointments;
DROP POLICY IF EXISTS "Enable update for all users" ON appointments;
DROP POLICY IF EXISTS "Enable delete for all users" ON appointments;

-- 3. Policy: Allow anonymous users to INSERT (for end-user booking)
CREATE POLICY "Enable insert for anon users" ON appointments
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- 4. Policy: Allow everyone to READ (for admin dashboard)
-- Note: In production, you should restrict this to authenticated admin users
CREATE POLICY "Enable read for all users" ON appointments
  FOR SELECT
  USING (true);

-- 5. Policy: Allow everyone to UPDATE (for admin status changes)
-- Note: In production, you should restrict this to authenticated admin users
CREATE POLICY "Enable update for all users" ON appointments
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- 6. Policy: Allow everyone to DELETE (for admin)
-- Note: In production, you should restrict this to authenticated admin users
CREATE POLICY "Enable delete for all users" ON appointments
  FOR DELETE
  USING (true);

-- 7. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(appointment_date);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status);
CREATE INDEX IF NOT EXISTS idx_appointments_phone ON appointments(patient_phone);
CREATE INDEX IF NOT EXISTS idx_appointments_patient_name ON appointments(patient_name);

-- 8. Verify policies
SELECT * FROM pg_policies WHERE tablename = 'appointments';

-- ============================================
-- PRODUCTION SECURITY RECOMMENDATIONS
-- ============================================
-- For production use, consider these improvements:

/*
-- A. Create admin users table
CREATE TABLE admin_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- B. Restrict READ/UPDATE/DELETE to authenticated admin users only
-- Replace policies 4, 5, 6 with:

DROP POLICY IF EXISTS "Enable read for all users" ON appointments;
CREATE POLICY "Enable read for admin only" ON appointments
  FOR SELECT
  USING (
    auth.uid() IN (SELECT id FROM admin_users)
  );

DROP POLICY IF EXISTS "Enable update for all users" ON appointments;
CREATE POLICY "Enable update for admin only" ON appointments
  FOR UPDATE
  USING (
    auth.uid() IN (SELECT id FROM admin_users)
  )
  WITH CHECK (
    auth.uid() IN (SELECT id FROM admin_users)
  );

DROP POLICY IF EXISTS "Enable delete for all users" ON appointments;
CREATE POLICY "Enable delete for admin only" ON appointments
  FOR DELETE
  USING (
    auth.uid() IN (SELECT id FROM admin_users)
  );

-- C. Insert your admin user (replace with your email)
INSERT INTO admin_users (id, email)
VALUES (
  auth.uid(),  -- Your Supabase auth user ID
  'admin@example.com'
);
*/
