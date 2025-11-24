-- ============================================
-- SCRIPT COMPLETO: Funcionalidades de Comentarios
-- Ejecutar este script en Supabase SQL Editor
-- ============================================

-- 1. Agregar parent_comment_id para comentarios anidados
-- ============================================
alter table public.comments 
add column if not exists parent_comment_id uuid references public.comments(id) on delete cascade;

-- Crear índice para parent_comment_id
create index if not exists comments_parent_comment_id_idx on public.comments(parent_comment_id);

-- 2. Crear tabla comment_likes
-- ============================================
create table if not exists public.comment_likes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  comment_id uuid not null references public.comments(id) on delete cascade,
  created_at timestamp with time zone default now(),
  unique(user_id, comment_id)
);

-- Habilitar RLS
alter table public.comment_likes enable row level security;

-- Políticas RLS para comment_likes
drop policy if exists "Comment likes are viewable by everyone" on public.comment_likes;
create policy "Comment likes are viewable by everyone"
  on public.comment_likes for select
  using (true);

drop policy if exists "Users can insert their own comment likes" on public.comment_likes;
create policy "Users can insert their own comment likes"
  on public.comment_likes for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can delete their own comment likes" on public.comment_likes;
create policy "Users can delete their own comment likes"
  on public.comment_likes for delete
  using (auth.uid() = user_id);

-- Crear índices para consultas eficientes
create index if not exists comment_likes_comment_id_idx on public.comment_likes(comment_id);
create index if not exists comment_likes_user_id_idx on public.comment_likes(user_id);

-- 3. Agregar image_url a comentarios
-- ============================================
alter table public.comments 
add column if not exists image_url text;

-- Crear índice para comentarios con imágenes (opcional, para rendimiento)
create index if not exists comments_image_url_idx on public.comments(image_url) where image_url is not null;

-- ============================================
-- NOTA IMPORTANTE SOBRE STORAGE:
-- ============================================
-- Los buckets de Storage NO se pueden crear con SQL.
-- Debes crear el bucket "posts" manualmente en el Dashboard:
--
-- 1. Ve a Supabase Dashboard > Storage
-- 2. Click en "New bucket"
-- 3. Nombre: "posts"
-- 4. Marca "Public bucket" ✅
-- 5. Click "Create bucket"
--
-- Después de crear el bucket, ejecuta el script:
-- scripts/012_storage_policies.sql
-- ============================================

