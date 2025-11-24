-- Add edited_at column to posts and comments tables
-- This will track when posts/comments were last edited

-- Add edited_at to posts
ALTER TABLE posts ADD COLUMN IF NOT EXISTS edited_at TIMESTAMPTZ;

-- Add edited_at to comments
ALTER TABLE comments ADD COLUMN IF NOT EXISTS edited_at TIMESTAMPTZ;

-- Create index for edited_at queries
CREATE INDEX IF NOT EXISTS posts_edited_at_idx ON posts(edited_at) WHERE edited_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS comments_edited_at_idx ON comments(edited_at) WHERE edited_at IS NOT NULL;

