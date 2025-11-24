-- Add image_url to comments table
alter table public.comments 
add column if not exists image_url text;

-- Create index for comments with images (optional, for performance)
create index if not exists comments_image_url_idx on public.comments(image_url) where image_url is not null;

