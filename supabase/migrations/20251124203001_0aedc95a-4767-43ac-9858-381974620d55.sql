-- تحديث الطلبات المرتبطة بالأنواع المكررة أولاً
UPDATE beneficiary_requests 
SET request_type_id = '49b396ea-645c-4253-9b97-9e84dd3d98f9' -- فزعة طارئة
WHERE request_type_id = '255c009d-4e4d-4896-9497-7396accde212'; -- فزعة

UPDATE beneficiary_requests 
SET request_type_id = '5c7372f7-98e1-4e56-8b49-cd05c2ead8c2' -- استقلالية
WHERE request_type_id = '7cc88887-754d-48e4-958e-ed31e7d5edf0'; -- استقلالية زوجة

UPDATE beneficiary_requests 
SET request_type_id = '71ed67d0-ec0b-4cbf-b71d-f414fd66db17' -- تحديث بيانات
WHERE request_type_id = '5d5fab55-5638-47d2-bffe-c4a85b794b45'; -- تحديث البيانات

-- الآن حذف الأنواع الزائدة
DELETE FROM request_types 
WHERE id IN (
  '7cc88887-754d-48e4-958e-ed31e7d5edf0',
  '5d5fab55-5638-47d2-bffe-c4a85b794b45',
  '0cab2d71-fcde-4faa-b0f0-bbd69416c135',
  '255c009d-4e4d-4896-9497-7396accde212'
);