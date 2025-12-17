-- توحيد بيانات tenants و families إلى اللغة العربية

-- توحيد حالة المستأجرين
UPDATE tenants SET status = 'نشط' WHERE status = 'active';
UPDATE tenants SET status = 'غير نشط' WHERE status = 'inactive';

-- توحيد حالة العائلات
UPDATE families SET status = 'نشط' WHERE status = 'active';
UPDATE families SET status = 'غير نشط' WHERE status = 'inactive';