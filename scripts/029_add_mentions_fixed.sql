-- Add mention notifications trigger (FIXED VERSION)
-- This will create notifications when users are mentioned in posts or comments

-- Trigger function for mention notifications in posts
CREATE OR REPLACE FUNCTION notify_post_mentions()
RETURNS TRIGGER AS $$
DECLARE
    mentioned_username TEXT;
    mentioned_user_id UUID;
    word TEXT;
BEGIN
    -- Extract mentions from post content using regex
    -- Pattern: @username (word characters only)
    -- Split by spaces and check each word
    FOR word IN
        SELECT unnest(string_to_array(NEW.content, ' '))
    LOOP
        -- Check if word matches @username pattern
        IF word ~ '^@\w+$' THEN
            -- Remove @ symbol
            mentioned_username := substring(word from 2);
            
            -- Find user by username
            SELECT id INTO mentioned_user_id
            FROM profiles
            WHERE username = mentioned_username;
            
            -- Create notification if user exists and is not the post author
            IF mentioned_user_id IS NOT NULL AND mentioned_user_id != NEW.author_id THEN
                PERFORM create_notification(
                    mentioned_user_id,
                    'mention',
                    NEW.author_id,
                    NEW.id,
                    NULL
                );
            END IF;
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
    word TEXT;
BEGIN
    -- Extract mentions from comment content
    -- Split by spaces and check each word
    FOR word IN
        SELECT unnest(string_to_array(NEW.content, ' '))
    LOOP
        -- Check if word matches @username pattern
        IF word ~ '^@\w+$' THEN
            -- Remove @ symbol
            mentioned_username := substring(word from 2);
            
            -- Find user by username
            SELECT id INTO mentioned_user_id
            FROM profiles
            WHERE username = mentioned_username;
            
            -- Create notification if user exists and is not the comment author
            IF mentioned_user_id IS NOT NULL AND mentioned_user_id != NEW.author_id THEN
                PERFORM create_notification(
                    mentioned_user_id,
                    'mention',
                    NEW.author_id,
                    NEW.post_id,
                    NEW.id
                );
            END IF;
        END IF;
    END LOOP;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing triggers first
DROP TRIGGER IF EXISTS on_post_mention_create_notification ON posts;
DROP TRIGGER IF EXISTS on_comment_mention_create_notification ON comments;
DROP TRIGGER IF EXISTS on_post_update_mention_create_notification ON posts;
DROP TRIGGER IF EXISTS on_comment_update_mention_create_notification ON comments;

-- Create triggers for INSERT
CREATE TRIGGER on_post_mention_create_notification
AFTER INSERT ON posts
FOR EACH ROW
WHEN (NEW.content ~ '@\w+')
EXECUTE FUNCTION notify_post_mentions();

CREATE TRIGGER on_comment_mention_create_notification
AFTER INSERT ON comments
FOR EACH ROW
WHEN (NEW.content ~ '@\w+')
EXECUTE FUNCTION notify_comment_mentions();

-- Also handle updates (in case someone edits to add a mention)
CREATE TRIGGER on_post_update_mention_create_notification
AFTER UPDATE ON posts
FOR EACH ROW
WHEN (NEW.content ~ '@\w+' AND (OLD.content IS DISTINCT FROM NEW.content))
EXECUTE FUNCTION notify_post_mentions();

CREATE TRIGGER on_comment_update_mention_create_notification
AFTER UPDATE ON comments
FOR EACH ROW
WHEN (NEW.content ~ '@\w+' AND (OLD.content IS DISTINCT FROM NEW.content))
EXECUTE FUNCTION notify_comment_mentions();

