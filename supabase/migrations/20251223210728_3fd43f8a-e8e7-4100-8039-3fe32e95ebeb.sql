-- إضافة الفهارس للجداول ذات Sequential Scans العالية

-- فهرس للصناديق النشطة
CREATE INDEX IF NOT EXISTS idx_funds_is_active ON funds(is_active);

-- فهرس لربط العائلات برئيس العائلة (الاسم الصحيح)
CREATE INDEX IF NOT EXISTS idx_families_head_of_family_id ON families(head_of_family_id);

-- فهرس للمهام حسب الحالة وتاريخ الإنشاء
CREATE INDEX IF NOT EXISTS idx_tasks_status_created ON tasks(status, created_at DESC);

-- فهرس لأدوار المستخدمين حسب الدور فقط
CREATE INDEX IF NOT EXISTS idx_user_roles_role_only ON user_roles(role);

-- فهرس للملفات الشخصية النشطة حسب الاسم
CREATE INDEX IF NOT EXISTS idx_profiles_active_name ON profiles(is_active, full_name);

-- فهرس لطلبات المستفيدين حسب الحالة والتاريخ
CREATE INDEX IF NOT EXISTS idx_beneficiary_requests_status_date ON beneficiary_requests(status, created_at DESC);

-- فهرس إضافي للقيود اليومية حسب التاريخ والحالة
CREATE INDEX IF NOT EXISTS idx_journal_entries_date_status ON journal_entries(entry_date DESC, status);

-- فهرس للمستفيدين حسب الحالة والفئة
CREATE INDEX IF NOT EXISTS idx_beneficiaries_status_category ON beneficiaries(status, category);

-- فهرس للعقود حسب الحالة وتاريخ الانتهاء
CREATE INDEX IF NOT EXISTS idx_contracts_status_end_date ON contracts(status, end_date);

-- فهرس للإشعارات غير المقروءة
CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON notifications(user_id, is_read) WHERE is_read = false;