-- حذف الفهارس المكررة (duplicate indexes)
-- 1. idx_tenant_sessions_token مكرر مع tenant_sessions_session_token_key
DROP INDEX IF EXISTS public.idx_tenant_sessions_token;

-- 2. idx_user_roles_user_id_role مكرر مع user_roles_user_id_role_key
DROP INDEX IF EXISTS public.idx_user_roles_user_id_role;

-- ملاحظة: storage.idx_objects_bucket_id_name مكرر مع storage.bucketid_objname
-- لا يمكن حذفه لأنه في schema storage المحمي