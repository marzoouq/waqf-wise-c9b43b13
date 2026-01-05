-- Create documents storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('documents', 'documents', true, 10485760, ARRAY['image/png', 'image/jpeg', 'image/gif', 'image/webp', 'application/pdf'])
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload to waqf-branding folder
CREATE POLICY "Allow authenticated users to upload branding files"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'documents' AND (storage.foldername(name))[1] = 'waqf-branding');

-- Allow authenticated users to update their branding files
CREATE POLICY "Allow authenticated users to update branding files"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'documents' AND (storage.foldername(name))[1] = 'waqf-branding');

-- Allow public read access to branding files
CREATE POLICY "Allow public read access to branding files"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'documents' AND (storage.foldername(name))[1] = 'waqf-branding');

-- Allow authenticated users to delete branding files
CREATE POLICY "Allow authenticated users to delete branding files"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'documents' AND (storage.foldername(name))[1] = 'waqf-branding');