-- Fix RLS policies for conversations and conversation_participants
-- NO RECURSION VERSION - Uses SECURITY DEFINER function with proper settings

-- First, drop ALL existing policies
DROP POLICY IF EXISTS "Users can view their conversations" ON conversations;
DROP POLICY IF EXISTS "Users can create conversations" ON conversations;
DROP POLICY IF EXISTS "Users can update their conversations" ON conversations;
DROP POLICY IF EXISTS "Users can view conversations" ON conversations;
DROP POLICY IF EXISTS "Users can update conversations" ON conversations;

DROP POLICY IF EXISTS "Users can view conversation participants" ON conversation_participants;
DROP POLICY IF EXISTS "Users can add participants" ON conversation_participants;
DROP POLICY IF EXISTS "Users can update their own participant record" ON conversation_participants;
DROP POLICY IF EXISTS "Users can view own participant records" ON conversation_participants;
DROP POLICY IF EXISTS "Users can view all participants" ON conversation_participants;
DROP POLICY IF EXISTS "Users can view other participants" ON conversation_participants;
DROP POLICY IF EXISTS "Users can update own participant" ON conversation_participants;

DROP POLICY IF EXISTS "Users can view messages in their conversations" ON messages;
DROP POLICY IF EXISTS "Users can send messages" ON messages;
DROP POLICY IF EXISTS "Users can update their own messages" ON messages;
DROP POLICY IF EXISTS "Users can delete their own messages" ON messages;
DROP POLICY IF EXISTS "Users can view messages" ON messages;
DROP POLICY IF EXISTS "Users can update own messages" ON messages;
DROP POLICY IF EXISTS "Users can delete own messages" ON messages;

-- Drop function if exists
DROP FUNCTION IF EXISTS user_is_participant(UUID, UUID);

-- Create a SECURITY DEFINER function that bypasses RLS
-- The function owner (postgres) can bypass RLS checks
CREATE OR REPLACE FUNCTION user_is_participant(conv_id UUID, u_id UUID)
RETURNS BOOLEAN 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
BEGIN
  -- This query bypasses RLS because function is SECURITY DEFINER
  RETURN EXISTS (
    SELECT 1 
    FROM public.conversation_participants
    WHERE conversation_id = conv_id
    AND user_id = u_id
  );
END;
$$;

-- Grant execute to authenticated users
GRANT EXECUTE ON FUNCTION user_is_participant(UUID, UUID) TO authenticated;

-- Conversation participants policies
-- Policy 1: Users can always see their own participant records (NO RECURSION - direct check)
CREATE POLICY "Users can view own participant records"
  ON conversation_participants FOR SELECT
  USING (user_id = auth.uid());

-- Policy 2: Users can see other participants using the function (NO RECURSION - function bypasses RLS)
CREATE POLICY "Users can view other participants"
  ON conversation_participants FOR SELECT
  USING (
    user_is_participant(conversation_id, auth.uid())
  );

CREATE POLICY "Users can add participants"
  ON conversation_participants FOR INSERT
  TO authenticated
  WITH CHECK (
    -- User can always add themselves
    user_id = auth.uid()
    OR
    -- User can add others if they're already a participant in that conversation
    user_is_participant(conversation_id, auth.uid())
  );

CREATE POLICY "Users can update own participant"
  ON conversation_participants FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Conversations policies
CREATE POLICY "Users can view conversations"
  ON conversations FOR SELECT
  USING (
    user_is_participant(id, auth.uid())
  );

CREATE POLICY "Users can create conversations"
  ON conversations FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update conversations"
  ON conversations FOR UPDATE
  USING (
    user_is_participant(id, auth.uid())
  );

-- Messages policies
CREATE POLICY "Users can view messages"
  ON messages FOR SELECT
  USING (
    user_is_participant(conversation_id, auth.uid())
  );

CREATE POLICY "Users can send messages"
  ON messages FOR INSERT
  WITH CHECK (
    sender_id = auth.uid()
    AND
    user_is_participant(conversation_id, auth.uid())
  );

CREATE POLICY "Users can update own messages"
  ON messages FOR UPDATE
  USING (sender_id = auth.uid())
  WITH CHECK (sender_id = auth.uid());

CREATE POLICY "Users can delete own messages"
  ON messages FOR DELETE
  USING (sender_id = auth.uid());
