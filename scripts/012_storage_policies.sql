-- Storage Policies for "posts" bucket
-- IMPORTANTE: Primero debes crear el bucket "posts" manualmente en el Dashboard de Supabase
-- Storage > New bucket > Name: "posts" > Public bucket > Create

-- Después de crear el bucket, ejecuta este script para configurar las políticas RLS

-- Policy 1: Allow authenticated users to upload files
drop policy if exists "Authenticated users can upload to posts" on storage.objects;
create policy "Authenticated users can upload to posts"
on storage.objects for insert
to authenticated
with check (bucket_id = 'posts');

-- Policy 2: Allow public read access (so images can be viewed)
drop policy if exists "Public can view posts images" on storage.objects;
create policy "Public can view posts images"
on storage.objects for select
to public
using (bucket_id = 'posts');

-- Policy 3: Allow users to update their own files
-- Files are organized as: {user_id}/comments/{filename} or {user_id}/{filename}
drop policy if exists "Users can update own files in posts" on storage.objects;
create policy "Users can update own files in posts"
on storage.objects for update
to authenticated
using (
  bucket_id = 'posts' 
  AND (storage.foldername(name))[1] = auth.uid()::text
)
with check (
  bucket_id = 'posts' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy 4: Allow users to delete their own files
drop policy if exists "Users can delete own files in posts" on storage.objects;
create policy "Users can delete own files in posts"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'posts' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

