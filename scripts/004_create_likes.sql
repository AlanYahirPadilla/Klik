-- Create likes table
create table if not exists public.likes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  post_id uuid not null references public.posts(id) on delete cascade,
  created_at timestamp with time zone default now(),
  unique(user_id, post_id)
);

-- Enable RLS
alter table public.likes enable row level security;

-- RLS Policies for likes
create policy "Likes are viewable by everyone"
  on public.likes for select
  using (true);

create policy "Users can insert their own likes"
  on public.likes for insert
  with check (auth.uid() = user_id);

create policy "Users can delete their own likes"
  on public.likes for delete
  using (auth.uid() = user_id);

-- Create indexes for efficient queries
create index likes_post_id_idx on public.likes(post_id);
create index likes_user_id_idx on public.likes(user_id);
