-- Temporary debug script to check if RLS is the issue
-- DO NOT USE IN PRODUCTION - Only for debugging

-- Check current RLS status
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('conversations', 'conversation_participants', 'messages');

-- Check existing policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE tablename IN ('conversations', 'conversation_participants', 'messages')
ORDER BY tablename, policyname;

-- Test query (should work if policies are correct)
-- Run this as the authenticated user
SELECT COUNT(*) FROM conversation_participants WHERE user_id = auth.uid();

