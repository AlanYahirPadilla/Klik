-- Add location and social media fields to profiles
alter table public.profiles 
add column if not exists location text,
add column if not exists website text,
add column if not exists twitter_url text,
add column if not exists instagram_url text,
add column if not exists facebook_url text,
add column if not exists tiktok_url text,
add column if not exists youtube_url text;

-- Create index for location searches
create index if not exists profiles_location_idx on public.profiles(location) where location is not null;

