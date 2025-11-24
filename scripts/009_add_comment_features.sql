-- Add parent_comment_id to comments table for nested comments
alter table public.comments 
add column if not exists parent_comment_id uuid references public.comments(id) on delete cascade;

-- Create index for parent_comment_id
create index if not exists comments_parent_comment_id_idx on public.comments(parent_comment_id);

-- Create comment_likes table
create table if not exists public.comment_likes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  comment_id uuid not null references public.comments(id) on delete cascade,
  created_at timestamp with time zone default now(),
  unique(user_id, comment_id)
);

-- Enable RLS
alter table public.comment_likes enable row level security;

-- RLS Policies for comment_likes
create policy "Comment likes are viewable by everyone"
  on public.comment_likes for select
  using (true);

create policy "Users can insert their own comment likes"
  on public.comment_likes for insert
  with check (auth.uid() = user_id);

create policy "Users can delete their own comment likes"
  on public.comment_likes for delete
  using (auth.uid() = user_id);

-- Create indexes for efficient queries
create index comment_likes_comment_id_idx on public.comment_likes(comment_id);
create index comment_likes_user_id_idx on public.comment_likes(user_id);

