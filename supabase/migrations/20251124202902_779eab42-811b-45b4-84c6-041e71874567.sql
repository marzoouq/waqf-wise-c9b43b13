-- حذف policies القديمة إن وجدت
DROP POLICY IF EXISTS "المستفيدون والموظفون يمكنهم رؤية المرفقات" ON storage.objects;
DROP POLICY IF EXISTS "المستفيدون يمكنهم رفع المرفقات" ON storage.objects;
DROP POLICY IF EXISTS "المستفيدون يمكنهم حذف مرفقاتهم" ON storage.objects;

-- إنشاء Storage Policies للمرفقات
CREATE POLICY "المستفيدون والموظفون يمكنهم رؤية المرفقات"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'request-attachments' AND (
    EXISTS (SELECT 1 FROM beneficiaries WHERE user_id = auth.uid()) OR
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'nazer', 'accountant', 'archivist'))
  )
);

CREATE POLICY "المستفيدون يمكنهم رفع المرفقات"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'request-attachments' AND
  EXISTS (SELECT 1 FROM beneficiaries WHERE user_id = auth.uid())
);

CREATE POLICY "المستفيدون يمكنهم حذف مرفقاتهم"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'request-attachments' AND
  EXISTS (SELECT 1 FROM beneficiaries WHERE user_id = auth.uid())
);

-- ربط بعض الرسائل بالطلبات
UPDATE internal_messages im
SET request_id = (
  SELECT br.id 
  FROM beneficiary_requests br 
  WHERE br.beneficiary_id IN (
    SELECT id FROM beneficiaries WHERE user_id = im.sender_id OR user_id = im.receiver_id
  )
  ORDER BY random() 
  LIMIT 1
)
WHERE im.request_id IS NULL AND im.id IN (
  SELECT id FROM internal_messages WHERE request_id IS NULL LIMIT 3
);