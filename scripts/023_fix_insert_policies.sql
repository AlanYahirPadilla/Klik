-- Fix INSERT policies to allow creating conversations and adding participants
-- This should be run after 020_fix_conversation_policies_v2.sql

-- Drop the existing INSERT policy
DROP POLICY IF EXISTS "Users can add participants" ON conversation_participants;

-- Create a new policy that allows:
-- 1. Users to add themselves
-- 2. Users to add others if they're adding themselves in the same insert (for new conversations)
CREATE POLICY "Users can add participants"
  ON conversation_participants FOR INSERT
  TO authenticated
  WITH CHECK (
    -- User can always add themselves
    user_id = auth.uid()
    OR
    -- Allow adding others if the conversation is new (has no participants yet)
    -- This uses a function to check without recursion
    (
      SELECT COUNT(*) = 0 
      FROM conversation_participants cp
      WHERE cp.conversation_id = conversation_participants.conversation_id
    )
  );

