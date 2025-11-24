-- Ultra-simple fix for conversation INSERT policy
-- This should definitely work

-- Drop all INSERT policies
DROP POLICY IF EXISTS "Users can create conversations" ON conversations;
DROP POLICY IF EXISTS "Authenticated users can create conversations" ON conversations;

-- Create the simplest possible policy
CREATE POLICY "allow_insert_conversations"
  ON conversations
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Test: This should show the policy
SELECT 
  tablename, 
  policyname, 
  cmd, 
  roles,
  with_check
FROM pg_policies
WHERE tablename = 'conversations' 
AND cmd = 'INSERT';

