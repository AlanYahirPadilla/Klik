-- Add banner_url to profiles table
alter table public.profiles 
add column if not exists banner_url text;

-- Create index for profiles with banners (optional, for performance)
create index if not exists profiles_banner_url_idx on public.profiles(banner_url) where banner_url is not null;

