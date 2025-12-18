-- حذف قيد CHECK القديم على payments.status
ALTER TABLE payments DROP CONSTRAINT IF EXISTS payments_status_check;

-- توحيد نوع الوحدة من الإنجليزية إلى العربية
UPDATE property_units SET unit_type = 'شقة' WHERE unit_type = 'apartment';
UPDATE property_units SET unit_type = 'فيلا' WHERE unit_type = 'villa';
UPDATE property_units SET unit_type = 'محل تجاري' WHERE unit_type = 'shop';
UPDATE property_units SET unit_type = 'مكتب' WHERE unit_type = 'office';
UPDATE property_units SET unit_type = 'مستودع' WHERE unit_type = 'warehouse';

-- توحيد حالة الوحدة من الإنجليزية إلى العربية
UPDATE property_units SET status = 'متاح' WHERE status = 'available';
UPDATE property_units SET status = 'مشغول' WHERE status = 'occupied';
UPDATE property_units SET status = 'صيانة' WHERE status = 'maintenance';
UPDATE property_units SET status = 'غير متاح' WHERE status = 'unavailable';

-- توحيد حالة المدفوعات من الإنجليزية إلى العربية
UPDATE payments SET status = 'مكتمل' WHERE status = 'completed';
UPDATE payments SET status = 'معلق' WHERE status = 'pending';
UPDATE payments SET status = 'ملغي' WHERE status = 'cancelled';
UPDATE payments SET status = 'مدفوع' WHERE status = 'paid';
UPDATE payments SET status = 'متأخر' WHERE status = 'overdue';

-- إضافة قيد CHECK جديد يدعم القيم العربية والإنجليزية
ALTER TABLE payments ADD CONSTRAINT payments_status_check 
CHECK (status IN ('معلق', 'مكتمل', 'ملغي', 'مدفوع', 'متأخر', 'مدفوع جزئياً', 'تحت التحصيل', 'pending', 'completed', 'cancelled', 'paid', 'overdue', 'partial', 'under_collection'));