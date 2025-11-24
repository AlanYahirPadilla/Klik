-- Note: Storage buckets cannot be created via SQL
-- You need to create the bucket manually in Supabase Dashboard:
-- 1. Go to Storage in your Supabase Dashboard
-- 2. Click "New bucket"
-- 3. Name it "posts"
-- 4. Make it PUBLIC (so images can be accessed without auth)
-- 5. Click "Create bucket"

-- After creating the bucket, you can set up RLS policies below
-- But first, you need to create the bucket manually in the Dashboard

-- Storage policies are managed through the Supabase Dashboard or Storage API
-- Here are the recommended policies for the "posts" bucket:

-- Policy 1: Allow authenticated users to upload files
-- Policy name: "Authenticated users can upload"
-- Policy type: INSERT
-- Policy definition: auth.role() = 'authenticated'

-- Policy 2: Allow public read access (so images can be viewed)
-- Policy name: "Public can view images"
-- Policy type: SELECT
-- Policy definition: true

-- Policy 3: Allow users to update their own files
-- Policy name: "Users can update own files"
-- Policy type: UPDATE
-- Policy definition: bucket_id = 'posts' AND (storage.foldername(name))[1] = auth.uid()::text

-- Policy 4: Allow users to delete their own files
-- Policy name: "Users can delete own files"
-- Policy type: DELETE
-- Policy definition: bucket_id = 'posts' AND (storage.foldername(name))[1] = auth.uid()::text

