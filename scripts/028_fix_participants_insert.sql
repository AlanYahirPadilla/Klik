-- Fix INSERT policy for conversation_participants
-- This allows users to add themselves and others in new conversations

-- Drop existing INSERT policy
DROP POLICY IF EXISTS "Users can add participants" ON conversation_participants;

-- Create a simple policy that allows:
-- 1. Users to always add themselves
-- 2. Users to add others if they're already participants OR if conversation is new (no participants yet)
CREATE POLICY "Users can add participants"
  ON conversation_participants FOR INSERT
  TO authenticated
  WITH CHECK (
    -- User can always add themselves
    user_id = auth.uid()
    OR
    -- User can add others if they're already a participant
    user_is_participant(conversation_id, auth.uid())
  );

-- Verify the policy
SELECT tablename, policyname, cmd, with_check
FROM pg_policies
WHERE tablename = 'conversation_participants' AND cmd = 'INSERT';

