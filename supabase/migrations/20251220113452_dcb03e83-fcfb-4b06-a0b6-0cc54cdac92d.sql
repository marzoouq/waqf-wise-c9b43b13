-- إضافة الفهارس المفقودة لتحسين أداء قاعدة البيانات
-- Adding missing indexes to improve database performance

-- فهرس لجدول profiles على user_id
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON public.profiles(user_id);

-- فهارس لجدول user_roles
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role ON public.user_roles(role);

-- فهرس لجدول funds على is_active
CREATE INDEX IF NOT EXISTS idx_funds_is_active ON public.funds(is_active);

-- فهارس لجدول families
CREATE INDEX IF NOT EXISTS idx_families_head_of_family ON public.families(head_of_family_id);

-- فهارس لجدول activities
CREATE INDEX IF NOT EXISTS idx_activities_timestamp ON public.activities(timestamp);
CREATE INDEX IF NOT EXISTS idx_activities_user_name ON public.activities(user_name);

-- فهارس لجدول tasks
CREATE INDEX IF NOT EXISTS idx_tasks_assigned_to ON public.tasks(assigned_to);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON public.tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON public.tasks(due_date);

-- فهارس إضافية لتحسين الأداء العام
CREATE INDEX IF NOT EXISTS idx_beneficiaries_status ON public.beneficiaries(status);
CREATE INDEX IF NOT EXISTS idx_beneficiaries_category ON public.beneficiaries(category);
CREATE INDEX IF NOT EXISTS idx_journal_entries_status ON public.journal_entries(status);
CREATE INDEX IF NOT EXISTS idx_journal_entries_entry_date ON public.journal_entries(entry_date);
CREATE INDEX IF NOT EXISTS idx_journal_entry_lines_account_id ON public.journal_entry_lines(account_id);
CREATE INDEX IF NOT EXISTS idx_contracts_status ON public.contracts(status);
CREATE INDEX IF NOT EXISTS idx_contracts_property_id ON public.contracts(property_id);
CREATE INDEX IF NOT EXISTS idx_properties_status ON public.properties(status);