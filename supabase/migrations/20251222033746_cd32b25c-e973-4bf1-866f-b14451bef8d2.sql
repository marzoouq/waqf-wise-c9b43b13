-- ============================================
-- تحسين أداء قاعدة البيانات
-- Performance Optimization Migration
-- ============================================

-- 1. إضافة Index مركب على user_roles (أولوية عالية - 80% sequential scans)
CREATE INDEX IF NOT EXISTS idx_user_roles_user_role 
ON public.user_roles(user_id, role);

-- 2. إضافة Index على funds للبحث السريع
CREATE INDEX IF NOT EXISTS idx_funds_active_lookup 
ON public.funds(id) WHERE is_active = true;

-- 3. إضافة Index على families
CREATE INDEX IF NOT EXISTS idx_families_lookup 
ON public.families(id);

-- 4. إضافة Index على profiles (يُستخدم كثيراً مع user_roles)
CREATE INDEX IF NOT EXISTS idx_profiles_user_id 
ON public.profiles(user_id);

-- 5. إضافة Index على beneficiaries للبحث السريع
CREATE INDEX IF NOT EXISTS idx_beneficiaries_status_active 
ON public.beneficiaries(id) WHERE status = 'نشط';

-- 6. إضافة Index على journal_entry_lines (sequential scans عالية)
CREATE INDEX IF NOT EXISTS idx_journal_entry_lines_entry_id 
ON public.journal_entry_lines(journal_entry_id);

-- ============================================
-- تحديث إحصائيات الجداول الرئيسية
-- ============================================
ANALYZE public.contracts;
ANALYZE public.heir_distributions;
ANALYZE public.chatbot_conversations;
ANALYZE public.project_documentation;
ANALYZE public.user_roles;
ANALYZE public.beneficiaries;
ANALYZE public.journal_entry_lines;
ANALYZE public.funds;
ANALYZE public.families;