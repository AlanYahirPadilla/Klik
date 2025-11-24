-- Create comments table
create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  author_id uuid not null references public.profiles(id) on delete cascade,
  content text not null,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Enable RLS
alter table public.comments enable row level security;

-- RLS Policies for comments
create policy "Comments are viewable by everyone"
  on public.comments for select
  using (true);

create policy "Users can insert their own comments"
  on public.comments for insert
  with check (auth.uid() = author_id);

create policy "Users can update their own comments"
  on public.comments for update
  using (auth.uid() = author_id);

create policy "Users can delete their own comments"
  on public.comments for delete
  using (auth.uid() = author_id);

-- Create indexes for efficient queries
create index comments_post_id_idx on public.comments(post_id);
create index comments_author_id_idx on public.comments(author_id);
create index comments_created_at_idx on public.comments(created_at desc);
