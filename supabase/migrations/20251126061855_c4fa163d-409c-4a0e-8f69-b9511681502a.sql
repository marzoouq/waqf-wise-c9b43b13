-- إضافة دور admin للمستخدم الحالي
INSERT INTO user_roles (user_id, role) 
VALUES ('18345445-e7ad-4886-9233-fca94026bc66', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;