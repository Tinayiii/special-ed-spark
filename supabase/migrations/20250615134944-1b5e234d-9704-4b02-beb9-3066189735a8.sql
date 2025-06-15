
-- Create a public bucket for storing generated images
INSERT INTO storage.buckets (id, name, public)
VALUES ('generated_images', 'generated_images', true)
ON CONFLICT (id) DO NOTHING;

-- Define RLS policies for the 'generated_images' bucket

-- 1. Allow public read access to all files in the bucket.
DROP POLICY IF EXISTS "Public Read Access for generated_images" ON storage.objects;
CREATE POLICY "Public Read Access for generated_images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'generated_images');

-- 2. Allow authenticated (logged-in) users to upload files to the bucket.
DROP POLICY IF EXISTS "Authenticated Insert for generated_images" ON storage.objects;
CREATE POLICY "Authenticated Insert for generated_images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'generated_images');

-- 3. Allow users to update their own files.
DROP POLICY IF EXISTS "Owner Update for generated_images" ON storage.objects;
CREATE POLICY "Owner Update for generated_images"
ON storage.objects FOR UPDATE
TO authenticated
USING (auth.uid() = owner)
WITH CHECK (bucket_id = 'generated_images');

-- 4. Allow users to delete their own files.
DROP POLICY IF EXISTS "Owner Delete for generated_images" ON storage.objects;
CREATE POLICY "Owner Delete for generated_images"
ON storage.objects FOR DELETE
TO authenticated
USING (auth.uid() = owner AND bucket_id = 'generated_images');
