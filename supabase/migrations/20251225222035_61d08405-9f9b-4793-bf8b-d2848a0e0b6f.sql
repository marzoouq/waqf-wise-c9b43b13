-- المرحلة 1: تفعيل الرؤية للمستفيدين
UPDATE beneficiary_visibility_settings 
SET show_requests = true, show_documents = true
WHERE target_role = 'beneficiary';

-- المرحلة 2: إضافة سياسة INSERT للمستفيدين على beneficiary_attachments
CREATE POLICY "beneficiaries_can_insert_own_attachments"
ON beneficiary_attachments FOR INSERT
WITH CHECK (
  beneficiary_id IN (
    SELECT id FROM beneficiaries WHERE user_id = auth.uid()
  )
);

-- المرحلة 3: إضافة سياسة DELETE للمستفيدين على beneficiary_attachments
CREATE POLICY "beneficiaries_can_delete_own_attachments"
ON beneficiary_attachments FOR DELETE
USING (
  beneficiary_id IN (
    SELECT id FROM beneficiaries WHERE user_id = auth.uid()
  )
);