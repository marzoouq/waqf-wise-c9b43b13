-- حذف الأنواع المكررة بشكل نهائي
-- الإبقاء فقط على السجل الأول من كل مجموعة متطابقة
DELETE FROM request_types rt1
WHERE id NOT IN (
  SELECT DISTINCT ON (name_ar) id
  FROM request_types
  ORDER BY name_ar, created_at
);