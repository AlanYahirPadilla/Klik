-- Add verification and role fields to profiles
alter table public.profiles 
add column if not exists email_verified boolean default false,
add column if not exists official_verified boolean default false,
add column if not exists role text default 'user' check (role in ('user', 'admin', 'support', 'owner'));

-- Create index for roles
create index if not exists profiles_role_idx on public.profiles(role);
create index if not exists profiles_official_verified_idx on public.profiles(official_verified) where official_verified = true;

-- Function to auto-update email_verified when user confirms email
create or replace function public.handle_email_verification()
returns trigger as $$
begin
  if new.email_confirmed_at is not null and old.email_confirmed_at is null then
    update public.profiles
    set email_verified = true
    where id = new.id;
  end if;
  return new;
end;
$$ language plpgsql security definer;

-- Trigger to update email_verified
drop trigger if exists on_auth_user_email_verified on auth.users;
create trigger on_auth_user_email_verified
  after update of email_confirmed_at on auth.users
  for each row
  execute function public.handle_email_verification();

