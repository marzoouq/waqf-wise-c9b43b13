-- إضافة فهرس user_roles لتحسين الأداء
CREATE INDEX IF NOT EXISTS idx_user_roles_user_role ON public.user_roles(user_id, role);