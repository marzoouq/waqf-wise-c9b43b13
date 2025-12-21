-- إصلاح: إضافة فهارس للجداول التي تحتاجها بناءً على الأعمدة الفعلية

-- فهارس لجدول funds
CREATE INDEX IF NOT EXISTS idx_funds_is_active ON public.funds(is_active);
CREATE INDEX IF NOT EXISTS idx_funds_created_at ON public.funds(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_funds_category ON public.funds(category);

-- فهارس لجدول families (العمود الصحيح هو head_of_family_id وليس head_id)
CREATE INDEX IF NOT EXISTS idx_families_head_of_family_id ON public.families(head_of_family_id);
CREATE INDEX IF NOT EXISTS idx_families_status ON public.families(status);
CREATE INDEX IF NOT EXISTS idx_families_created_at ON public.families(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_families_tribe ON public.families(tribe);

-- فهارس لجدول tasks
CREATE INDEX IF NOT EXISTS idx_tasks_status ON public.tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_assigned_to ON public.tasks(assigned_to);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON public.tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_tasks_priority ON public.tasks(priority);
CREATE INDEX IF NOT EXISTS idx_tasks_created_at ON public.tasks(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_tasks_created_by ON public.tasks(created_by);

-- فهارس لجدول user_roles
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role ON public.user_roles(role);

-- فهارس لجدول journal_entry_lines
CREATE INDEX IF NOT EXISTS idx_journal_entry_lines_account_id ON public.journal_entry_lines(account_id);
CREATE INDEX IF NOT EXISTS idx_journal_entry_lines_journal_entry_id ON public.journal_entry_lines(journal_entry_id);

-- فهارس لجدول profiles
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON public.profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_is_active ON public.profiles(is_active);