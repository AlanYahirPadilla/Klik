-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL, -- 'follow', 'like', 'comment', 'mention', 'reply'
  actor_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  comment_id UUID REFERENCES comments(id) ON DELETE CASCADE,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for notifications
DROP POLICY IF EXISTS "Users can view their own notifications" ON notifications;
CREATE POLICY "Users can view their own notifications"
  ON notifications FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own notifications" ON notifications;
CREATE POLICY "Users can update their own notifications"
  ON notifications FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "System can create notifications" ON notifications;
CREATE POLICY "System can create notifications"
  ON notifications FOR INSERT
  WITH CHECK (true);

-- Create indexes for efficient queries
CREATE INDEX IF NOT EXISTS notifications_user_id_idx ON notifications(user_id);
CREATE INDEX IF NOT EXISTS notifications_user_id_read_idx ON notifications(user_id, read);
CREATE INDEX IF NOT EXISTS notifications_created_at_idx ON notifications(created_at DESC);

-- Function to create notification
CREATE OR REPLACE FUNCTION create_notification(
  p_user_id UUID,
  p_type VARCHAR,
  p_actor_id UUID,
  p_post_id UUID DEFAULT NULL,
  p_comment_id UUID DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_notification_id UUID;
BEGIN
  -- Don't create notification if user is acting on their own content
  IF p_user_id = p_actor_id THEN
    RETURN NULL;
  END IF;

  INSERT INTO notifications (user_id, type, actor_id, post_id, comment_id)
  VALUES (p_user_id, p_type, p_actor_id, p_post_id, p_comment_id)
  RETURNING id INTO v_notification_id;

  RETURN v_notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger function for follow notifications
CREATE OR REPLACE FUNCTION notify_follow()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM create_notification(
    NEW.following_id,
    'follow',
    NEW.follower_id
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for follows
DROP TRIGGER IF EXISTS on_follow_create_notification ON follows;
CREATE TRIGGER on_follow_create_notification
  AFTER INSERT ON follows
  FOR EACH ROW
  EXECUTE FUNCTION notify_follow();

-- Trigger function for like notifications
CREATE OR REPLACE FUNCTION notify_like()
RETURNS TRIGGER AS $$
DECLARE
  v_author_id UUID;
BEGIN
  -- Get post author
  SELECT author_id INTO v_author_id FROM posts WHERE id = NEW.post_id;
  
  PERFORM create_notification(
    v_author_id,
    'like',
    NEW.user_id,
    NEW.post_id
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for likes
DROP TRIGGER IF EXISTS on_like_create_notification ON likes;
CREATE TRIGGER on_like_create_notification
  AFTER INSERT ON likes
  FOR EACH ROW
  EXECUTE FUNCTION notify_like();

-- Trigger function for comment notifications
CREATE OR REPLACE FUNCTION notify_comment()
RETURNS TRIGGER AS $$
DECLARE
  v_author_id UUID;
  v_parent_comment_author_id UUID;
BEGIN
  -- Get post author
  SELECT author_id INTO v_author_id FROM posts WHERE id = NEW.post_id;
  
  -- Notify post author
  PERFORM create_notification(
    v_author_id,
    'comment',
    NEW.author_id,
    NEW.post_id,
    NEW.id
  );

  -- If it's a reply, notify parent comment author
  IF NEW.parent_comment_id IS NOT NULL THEN
    SELECT author_id INTO v_parent_comment_author_id 
    FROM comments WHERE id = NEW.parent_comment_id;
    
    IF v_parent_comment_author_id IS NOT NULL AND v_parent_comment_author_id != NEW.author_id THEN
      PERFORM create_notification(
        v_parent_comment_author_id,
        'reply',
        NEW.author_id,
        NEW.post_id,
        NEW.id
      );
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for comments
DROP TRIGGER IF EXISTS on_comment_create_notification ON comments;
CREATE TRIGGER on_comment_create_notification
  AFTER INSERT ON comments
  FOR EACH ROW
  EXECUTE FUNCTION notify_comment();

