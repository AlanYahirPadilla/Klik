-- Create admin user
-- Email: admin@klik.app
-- Password: Admin123!

-- Insert user into auth.users
INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  role,
  aud
) VALUES (
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890'::uuid,
  '00000000-0000-0000-0000-000000000000'::uuid,
  'admin@klik.app',
  crypt('Admin123!', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '{"provider": "email", "providers": ["email"]}',
  '{}',
  false,
  'authenticated',
  'authenticated'
);

-- Insert profile for admin user
INSERT INTO public.profiles (
  id,
  username,
  display_name,
  bio,
  avatar_url,
  created_at,
  updated_at
) VALUES (
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890'::uuid,
  'admin',
  'Administrador',
  'Usuario administrador de Klik',
  null,
  NOW(),
  NOW()
);
