-- Final fix for conversations INSERT policy
-- This will check current state and fix it

-- Step 1: Check current policies
SELECT 'Current policies:' as info;
SELECT tablename, policyname, cmd, roles, with_check
FROM pg_policies
WHERE tablename = 'conversations'
ORDER BY cmd, policyname;

-- Step 2: Drop ALL policies for conversations
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

-- Step 3: Verify RLS is enabled
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

-- Step 4: Create policies in correct order
-- First, SELECT policy (needs to exist for the function to work)
CREATE POLICY "conversations_select_policy"
  ON conversations FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM conversation_participants cp
      WHERE cp.conversation_id = conversations.id
      AND cp.user_id = auth.uid()
    )
  );

-- Second, INSERT policy (MUST be simple and work)
CREATE POLICY "conversations_insert_policy"
  ON conversations FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Third, UPDATE policy
CREATE POLICY "conversations_update_policy"
  ON conversations FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM conversation_participants cp
      WHERE cp.conversation_id = conversations.id
      AND cp.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM conversation_participants cp
      WHERE cp.conversation_id = conversations.id
      AND cp.user_id = auth.uid()
    )
  );

-- Step 5: Verify policies were created
SELECT 'New policies:' as info;
SELECT tablename, policyname, cmd, roles, with_check
FROM pg_policies
WHERE tablename = 'conversations'
ORDER BY cmd, policyname;

