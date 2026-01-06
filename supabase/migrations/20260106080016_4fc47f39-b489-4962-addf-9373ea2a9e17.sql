-- ============================================
-- إضافة فهارس محسّنة لتقليل Sequential Scans
-- ============================================

-- 1️⃣ user_roles: فهرس على role للاستعلامات الشائعة
CREATE INDEX IF NOT EXISTS idx_user_roles_role 
ON public.user_roles (role);

CREATE INDEX IF NOT EXISTS idx_user_roles_role_user 
ON public.user_roles (role, user_id);

-- 2️⃣ profiles: فهرس على full_name للبحث
CREATE INDEX IF NOT EXISTS idx_profiles_full_name 
ON public.profiles (full_name);

-- 3️⃣ funds: فهرس على category للاستعلامات
CREATE INDEX IF NOT EXISTS idx_funds_category 
ON public.funds (category) WHERE is_active = true;

-- 4️⃣ families: فهرس على family_name للبحث
CREATE INDEX IF NOT EXISTS idx_families_name 
ON public.families (family_name);

-- 5️⃣ tasks: فهرس على assigned_to للاستعلامات
CREATE INDEX IF NOT EXISTS idx_tasks_assigned 
ON public.tasks (assigned_to) WHERE status != 'completed';

-- 6️⃣ activities: فهرس على user_name للبحث
CREATE INDEX IF NOT EXISTS idx_activities_user 
ON public.activities (user_name);

-- 7️⃣ beneficiary_requests: فهرس للحالة والمستفيد
CREATE INDEX IF NOT EXISTS idx_beneficiary_requests_status_beneficiary 
ON public.beneficiary_requests (status, beneficiary_id);

-- 8️⃣ journal_entry_lines: فهرس على account_id
CREATE INDEX IF NOT EXISTS idx_journal_entry_lines_account 
ON public.journal_entry_lines (account_id);