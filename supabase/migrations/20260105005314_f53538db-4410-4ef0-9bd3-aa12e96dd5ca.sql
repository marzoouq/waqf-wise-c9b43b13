-- Storage bucket for archive documents (user uploads)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'archive-documents',
  'archive-documents',
  true,
  20971520,
  ARRAY[
    'application/pdf',
    'image/png','image/jpeg','image/gif','image/webp',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ]
)
ON CONFLICT (id) DO NOTHING;

-- Policies for archive-documents bucket
CREATE POLICY "Archive docs: authenticated upload"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'archive-documents');

CREATE POLICY "Archive docs: authenticated update"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'archive-documents');

CREATE POLICY "Archive docs: authenticated delete"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'archive-documents');

CREATE POLICY "Archive docs: public read"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'archive-documents');
