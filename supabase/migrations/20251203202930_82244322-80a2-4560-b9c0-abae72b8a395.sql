-- إضافة صلاحية تعديل البريد الإلكتروني
INSERT INTO permissions (name, category, description)
VALUES ('admin.edit_user_email', 'admin', 'تعديل البريد الإلكتروني للمستخدمين')
ON CONFLICT (name) DO NOTHING;

-- ربط الصلاحية بالناظر
INSERT INTO role_permissions (role, permission_id, granted)
SELECT 'nazer', id, true FROM permissions WHERE name = 'admin.edit_user_email'
ON CONFLICT DO NOTHING;

-- ربط الصلاحية بالمشرف
INSERT INTO role_permissions (role, permission_id, granted)
SELECT 'admin', id, true FROM permissions WHERE name = 'admin.edit_user_email'
ON CONFLICT DO NOTHING;