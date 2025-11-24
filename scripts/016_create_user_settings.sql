-- Create user_settings table for privacy and general settings
create table if not exists public.user_settings (
  id uuid primary key references auth.users(id) on delete cascade,
  profile_visibility text default 'public' check (profile_visibility in ('public', 'followers', 'private')),
  show_email boolean default false,
  show_location boolean default true,
  allow_direct_messages boolean default true,
  show_online_status boolean default true,
  email_notifications boolean default true,
  push_notifications boolean default true,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Enable RLS
alter table public.user_settings enable row level security;

-- RLS Policies for user_settings
create policy "Users can view their own settings"
  on public.user_settings for select
  using (auth.uid() = id);

create policy "Users can insert their own settings"
  on public.user_settings for insert
  with check (auth.uid() = id);

create policy "Users can update their own settings"
  on public.user_settings for update
  using (auth.uid() = id);

-- Create index
create index if not exists user_settings_id_idx on public.user_settings(id);

