-- Fix the INSERT policy for conversations table
-- This script will verify and fix the policy

-- First, check current policies
SELECT schemaname, tablename, policyname, cmd, permissive, roles, qual, with_check
FROM pg_policies
WHERE tablename = 'conversations';

-- Drop ALL existing INSERT policies for conversations
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'conversations' 
        AND cmd = 'INSERT'
    ) 
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON conversations';
    END LOOP;
END $$;

-- Create a new, simple INSERT policy
-- For INSERT, we only need WITH CHECK, not USING
-- Make it PERMISSIVE and for authenticated role
CREATE POLICY "Users can create conversations"
  ON conversations FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Also create a policy that allows anon (just in case)
-- But this should not be needed if user is authenticated
CREATE POLICY "Authenticated users can create conversations"
  ON conversations FOR INSERT
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Verify policies were created
SELECT schemaname, tablename, policyname, cmd, with_check
FROM pg_policies
WHERE tablename = 'conversations' AND cmd = 'INSERT';
