-- Add analytics tables for profile views, post stats, and user lists

-- 1. Profile views tracking
-- ============================================
CREATE TABLE IF NOT EXISTS profile_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  viewer_id UUID REFERENCES profiles(id) ON DELETE SET NULL, -- NULL for anonymous views
  viewed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  viewed_date DATE NOT NULL DEFAULT CURRENT_DATE -- Separate column for date-only comparison
);

-- Create unique constraint on date column
CREATE UNIQUE INDEX IF NOT EXISTS profile_views_unique_daily 
  ON profile_views(profile_id, viewer_id, viewed_date);

-- Enable RLS
ALTER TABLE profile_views ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profile_views
DROP POLICY IF EXISTS "Users can view their own profile views" ON profile_views;
CREATE POLICY "Users can view their own profile views"
  ON profile_views FOR SELECT
  USING (auth.uid() = profile_id);

DROP POLICY IF EXISTS "Anyone can create profile views" ON profile_views;
CREATE POLICY "Anyone can create profile views"
  ON profile_views FOR INSERT
  WITH CHECK (true);

-- Indexes
CREATE INDEX IF NOT EXISTS profile_views_profile_id_idx ON profile_views(profile_id);
CREATE INDEX IF NOT EXISTS profile_views_viewed_at_idx ON profile_views(viewed_at DESC);
CREATE INDEX IF NOT EXISTS profile_views_viewed_date_idx ON profile_views(viewed_date DESC);

-- 2. Post shares tracking (if not already exists)
-- ============================================
-- Check if shares column exists, if not add it
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'posts' AND column_name = 'shares_count'
  ) THEN
    ALTER TABLE posts ADD COLUMN shares_count INTEGER DEFAULT 0;
  END IF;
END $$;

-- Create post_shares table to track who shared what
CREATE TABLE IF NOT EXISTS post_shares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  shared_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(post_id, user_id) -- One share per user per post
);

-- Enable RLS
ALTER TABLE post_shares ENABLE ROW LEVEL SECURITY;

-- RLS Policies for post_shares
DROP POLICY IF EXISTS "Anyone can view post shares" ON post_shares;
CREATE POLICY "Anyone can view post shares"
  ON post_shares FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Users can share posts" ON post_shares;
CREATE POLICY "Users can share posts"
  ON post_shares FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own shares" ON post_shares;
CREATE POLICY "Users can delete their own shares"
  ON post_shares FOR DELETE
  USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX IF NOT EXISTS post_shares_post_id_idx ON post_shares(post_id);
CREATE INDEX IF NOT EXISTS post_shares_user_id_idx ON post_shares(user_id);

-- Function to update shares_count
CREATE OR REPLACE FUNCTION update_post_shares_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE posts SET shares_count = shares_count + 1 WHERE id = NEW.post_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE posts SET shares_count = GREATEST(shares_count - 1, 0) WHERE id = OLD.post_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update shares_count
DROP TRIGGER IF EXISTS on_post_share_update_count ON post_shares;
CREATE TRIGGER on_post_share_update_count
  AFTER INSERT OR DELETE ON post_shares
  FOR EACH ROW
  EXECUTE FUNCTION update_post_shares_count();

-- 3. User lists (custom lists like "Amigos", "Famosos")
-- ============================================
CREATE TABLE IF NOT EXISTS user_lists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE user_lists ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_lists
DROP POLICY IF EXISTS "Users can view their own lists" ON user_lists;
CREATE POLICY "Users can view their own lists"
  ON user_lists FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create their own lists" ON user_lists;
CREATE POLICY "Users can create their own lists"
  ON user_lists FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own lists" ON user_lists;
CREATE POLICY "Users can update their own lists"
  ON user_lists FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own lists" ON user_lists;
CREATE POLICY "Users can delete their own lists"
  ON user_lists FOR DELETE
  USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX IF NOT EXISTS user_lists_user_id_idx ON user_lists(user_id);

-- 4. User list members (users in each list)
-- ============================================
CREATE TABLE IF NOT EXISTS user_list_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  list_id UUID NOT NULL REFERENCES user_lists(id) ON DELETE CASCADE,
  member_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  added_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(list_id, member_id) -- One entry per user per list
);

-- Enable RLS
ALTER TABLE user_list_members ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_list_members
DROP POLICY IF EXISTS "Users can view members of their lists" ON user_list_members;
CREATE POLICY "Users can view members of their lists"
  ON user_list_members FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_lists
      WHERE user_lists.id = user_list_members.list_id
      AND user_lists.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can add members to their lists" ON user_list_members;
CREATE POLICY "Users can add members to their lists"
  ON user_list_members FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_lists
      WHERE user_lists.id = user_list_members.list_id
      AND user_lists.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can remove members from their lists" ON user_list_members;
CREATE POLICY "Users can remove members from their lists"
  ON user_list_members FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM user_lists
      WHERE user_lists.id = user_list_members.list_id
      AND user_lists.user_id = auth.uid()
    )
  );

-- Indexes
CREATE INDEX IF NOT EXISTS user_list_members_list_id_idx ON user_list_members(list_id);
CREATE INDEX IF NOT EXISTS user_list_members_member_id_idx ON user_list_members(member_id);

-- Function to update user_lists.updated_at
CREATE OR REPLACE FUNCTION update_user_list_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE user_lists SET updated_at = NOW() WHERE id = NEW.list_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update updated_at when members are added
DROP TRIGGER IF EXISTS on_user_list_member_add_update_list ON user_list_members;
CREATE TRIGGER on_user_list_member_add_update_list
  AFTER INSERT ON user_list_members
  FOR EACH ROW
  EXECUTE FUNCTION update_user_list_updated_at();

