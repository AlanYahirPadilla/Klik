-- Add mention notifications trigger
-- This will create notifications when users are mentioned in posts or comments

-- Update create_notification function to handle mentions
-- (The function already exists, we just need to ensure it works with mentions)

-- Trigger function for mention notifications in posts
CREATE OR REPLACE FUNCTION notify_post_mentions()
RETURNS TRIGGER AS $$
DECLARE
    mentioned_username TEXT;
    mentioned_user_id UUID;
BEGIN
    -- Extract mentions from post content using regex
    -- Pattern: @username (word characters only)
    FOR mentioned_username IN
        SELECT DISTINCT regexp_split_to_table(NEW.content, '\s+')
        WHERE regexp_split_to_table ~ '^@\w+$'
    LOOP
        -- Remove @ symbol
        mentioned_username := substring(mentioned_username from 2);
        
        -- Find user by username
        SELECT id INTO mentioned_user_id
        FROM profiles
        WHERE username = mentioned_username;
        
        -- Create notification if user exists and is not the post author
        IF mentioned_user_id IS NOT NULL AND mentioned_user_id != NEW.user_id THEN
            PERFORM create_notification(
                mentioned_user_id,
                'mention',
                NEW.user_id,
                NEW.id,
                NULL
            );
        END IF;
    END LOOP;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger function for mention notifications in comments
CREATE OR REPLACE FUNCTION notify_comment_mentions()
RETURNS TRIGGER AS $$
DECLARE
    mentioned_username TEXT;
    mentioned_user_id UUID;
BEGIN
    -- Extract mentions from comment content
    FOR mentioned_username IN
        SELECT DISTINCT regexp_split_to_table(NEW.content, '\s+')
        WHERE regexp_split_to_table ~ '^@\w+$'
    LOOP
        -- Remove @ symbol
        mentioned_username := substring(mentioned_username from 2);
        
        -- Find user by username
        SELECT id INTO mentioned_user_id
        FROM profiles
        WHERE username = mentioned_username;
        
        -- Create notification if user exists and is not the comment author
        IF mentioned_user_id IS NOT NULL AND mentioned_user_id != NEW.user_id THEN
            PERFORM create_notification(
                mentioned_user_id,
                'mention',
                NEW.user_id,
                NEW.post_id,
                NEW.id
            );
        END IF;
    END LOOP;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
DROP TRIGGER IF EXISTS on_post_mention_create_notification ON posts;
CREATE TRIGGER on_post_mention_create_notification
AFTER INSERT ON posts
FOR EACH ROW
WHEN (NEW.content ~ '@\w+')
EXECUTE FUNCTION notify_post_mentions();

DROP TRIGGER IF EXISTS on_comment_mention_create_notification ON comments;
CREATE TRIGGER on_comment_mention_create_notification
AFTER INSERT ON comments
FOR EACH ROW
WHEN (NEW.content ~ '@\w+')
EXECUTE FUNCTION notify_comment_mentions();

-- Also handle updates (in case someone edits to add a mention)
DROP TRIGGER IF EXISTS on_post_update_mention_create_notification ON posts;
CREATE TRIGGER on_post_update_mention_create_notification
AFTER UPDATE ON posts
FOR EACH ROW
WHEN (NEW.content ~ '@\w+' AND (OLD.content IS DISTINCT FROM NEW.content))
EXECUTE FUNCTION notify_post_mentions();

DROP TRIGGER IF EXISTS on_comment_update_mention_create_notification ON comments;
CREATE TRIGGER on_comment_update_mention_create_notification
AFTER UPDATE ON comments
FOR EACH ROW
WHEN (NEW.content ~ '@\w+' AND (OLD.content IS DISTINCT FROM NEW.content))
EXECUTE FUNCTION notify_comment_mentions();

