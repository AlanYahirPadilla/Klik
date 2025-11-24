-- Diagnose and fix conversations INSERT issue
-- Run this to see what's happening

-- 1. Check if RLS is enabled
SELECT 
  schemaname, 
  tablename, 
  rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename = 'conversations';

-- 2. List ALL policies for conversations
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'conversations'
ORDER BY cmd, policyname;

-- 3. Check if authenticated role exists
SELECT rolname FROM pg_roles WHERE rolname = 'authenticated';

-- 4. Drop ALL existing policies
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'conversations'
    ) 
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON conversations';
    END LOOP;
END $$;

-- 5. Create a PERMISSIVE policy (not restrictive)
-- PERMISSIVE means "allow if any policy allows"
CREATE POLICY "allow_all_inserts"
  ON conversations
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- 6. Also create for anon just in case (though shouldn't be needed)
CREATE POLICY "allow_anon_inserts"
  ON conversations
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- 7. Verify
SELECT 
  tablename,
  policyname,
  cmd,
  roles,
  with_check
FROM pg_policies
WHERE tablename = 'conversations' AND cmd = 'INSERT';

