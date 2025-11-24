-- المرحلة 1: إنشاء جداول الصلاحيات ونظام الصلاحيات الدقيقة (Fixed)

-- 1.1 جدول الصلاحيات الرئيسي
CREATE TABLE IF NOT EXISTS public.permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 1.2 ربط الصلاحيات بالأدوار
CREATE TABLE IF NOT EXISTS public.role_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role TEXT NOT NULL,
  permission_id UUID REFERENCES public.permissions(id) ON DELETE CASCADE,
  granted BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(role, permission_id)
);

-- 1.3 صلاحيات مخصصة للمستخدمين (User Overrides)
CREATE TABLE IF NOT EXISTS public.user_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  permission_id UUID REFERENCES public.permissions(id) ON DELETE CASCADE,
  granted BOOLEAN NOT NULL,
  granted_by UUID,
  granted_at TIMESTAMPTZ DEFAULT NOW(),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, permission_id)
);

-- 1.4 سجل تدقيق الصلاحيات
CREATE TABLE IF NOT EXISTS public.permissions_audit (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  permission_id UUID REFERENCES public.permissions(id),
  action TEXT NOT NULL,
  granted BOOLEAN NOT NULL,
  performed_by UUID,
  performed_by_name TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.permissions_audit ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Admin can view all permissions" ON public.permissions;
DROP POLICY IF EXISTS "Admin can manage role permissions" ON public.role_permissions;
DROP POLICY IF EXISTS "Admin can manage user permissions" ON public.user_permissions;
DROP POLICY IF EXISTS "Users can view their own permissions" ON public.user_permissions;
DROP POLICY IF EXISTS "Admin can view audit logs" ON public.permissions_audit;

-- RLS Policies for permissions (admin only)
CREATE POLICY "Admin can view all permissions"
ON public.permissions FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role IN ('admin', 'nazer')
  )
);

-- RLS Policies for role_permissions (admin only)
CREATE POLICY "Admin can manage role permissions"
ON public.role_permissions FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role IN ('admin', 'nazer')
  )
);

-- RLS Policies for user_permissions
CREATE POLICY "Admin can manage user permissions"
ON public.user_permissions FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role IN ('admin', 'nazer')
  )
);

CREATE POLICY "Users can view their own permissions"
ON public.user_permissions FOR SELECT
USING (user_id = auth.uid());

-- RLS Policies for permissions_audit
CREATE POLICY "Admin can view audit logs"
ON public.permissions_audit FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role IN ('admin', 'nazer')
  )
);

-- 1.5 دالة التحقق من الصلاحيات
CREATE OR REPLACE FUNCTION public.has_permission(
  _user_id UUID,
  _permission TEXT
) RETURNS BOOLEAN
LANGUAGE SQL STABLE SECURITY DEFINER
AS $$
  SELECT CASE
    WHEN EXISTS (
      SELECT 1 FROM public.user_permissions up
      INNER JOIN public.permissions p ON p.id = up.permission_id
      WHERE up.user_id = _user_id
        AND p.name = _permission
    ) THEN (
      SELECT up.granted FROM public.user_permissions up
      INNER JOIN public.permissions p ON p.id = up.permission_id
      WHERE up.user_id = _user_id AND p.name = _permission
      LIMIT 1
    )
    ELSE (
      EXISTS (
        SELECT 1 FROM public.user_roles ur
        INNER JOIN public.role_permissions rp ON rp.role = ur.role
        INNER JOIN public.permissions p ON p.id = rp.permission_id
        WHERE ur.user_id = _user_id
          AND p.name = _permission
          AND rp.granted = true
      )
    )
  END;
$$;

-- 1.6 إضافة الصلاحيات الأساسية (100+ صلاحية منظمة)

-- Funds Permissions
INSERT INTO public.permissions (name, category, description) VALUES
('funds.view', 'funds', 'عرض المصارف والأقلام'),
('funds.add', 'funds', 'إضافة مصارف جديدة'),
('funds.edit', 'funds', 'تعديل المصارف'),
('funds.delete', 'funds', 'حذف المصارف'),
('funds.approve_level_1', 'funds', 'الموافقة على التوزيعات - المستوى 1'),
('funds.approve_level_2', 'funds', 'الموافقة على التوزيعات - المستوى 2'),
('funds.approve_level_3', 'funds', 'الموافقة على التوزيعات - المستوى 3 (الناظر)'),
('funds.simulate', 'funds', 'محاكاة التوزيعات'),
('funds.export', 'funds', 'تصدير بيانات المصارف'),
('funds.view_history', 'funds', 'عرض سجل التوزيعات'),
('funds.configure_rules', 'funds', 'تكوين قواعد التوزيع'),
('funds.view_beneficiaries', 'funds', 'عرض المستفيدين من المصرف'),
('funds.allocate', 'funds', 'تخصيص المبالغ'),
('funds.view_reports', 'funds', 'عرض تقارير المصارف'),
('funds.manage_deductions', 'funds', 'إدارة الاستقطاعات')
ON CONFLICT (name) DO NOTHING;

-- Accounting Permissions
INSERT INTO public.permissions (name, category, description) VALUES
('accounting.view', 'accounting', 'عرض المحاسبة'),
('accounting.view_journal_entries', 'accounting', 'عرض القيود اليومية'),
('accounting.add_journal_entry', 'accounting', 'إضافة قيد يومية'),
('accounting.edit_journal_entry', 'accounting', 'تعديل قيد يومية'),
('accounting.delete_journal_entry', 'accounting', 'حذف قيد يومية'),
('accounting.post_journal_entry', 'accounting', 'ترحيل القيود'),
('accounting.view_chart_of_accounts', 'accounting', 'عرض شجرة الحسابات'),
('accounting.edit_chart_of_accounts', 'accounting', 'تعديل شجرة الحسابات'),
('accounting.view_trial_balance', 'accounting', 'عرض ميزان المراجعة'),
('accounting.view_balance_sheet', 'accounting', 'عرض الميزانية العمومية'),
('accounting.view_income_statement', 'accounting', 'عرض قائمة الدخل'),
('accounting.view_cash_flow', 'accounting', 'عرض قائمة التدفقات النقدية'),
('accounting.reconcile_bank', 'accounting', 'التسوية البنكية'),
('accounting.view_bank_accounts', 'accounting', 'عرض الحسابات البنكية'),
('accounting.manage_bank_accounts', 'accounting', 'إدارة الحسابات البنكية'),
('accounting.approve_entries', 'accounting', 'الموافقة على القيود'),
('accounting.export_reports', 'accounting', 'تصدير التقارير المحاسبية'),
('accounting.view_fiscal_years', 'accounting', 'عرض السنوات المالية'),
('accounting.manage_fiscal_years', 'accounting', 'إدارة السنوات المالية'),
('accounting.close_period', 'accounting', 'إغلاق الفترة المحاسبية')
ON CONFLICT (name) DO NOTHING;

-- Beneficiaries Permissions
INSERT INTO public.permissions (name, category, description) VALUES
('beneficiaries.view', 'beneficiaries', 'عرض المستفيدين'),
('beneficiaries.add', 'beneficiaries', 'إضافة مستفيد'),
('beneficiaries.edit', 'beneficiaries', 'تعديل بيانات المستفيد'),
('beneficiaries.delete', 'beneficiaries', 'حذف مستفيد'),
('beneficiaries.view_requests', 'beneficiaries', 'عرض طلبات المستفيدين'),
('beneficiaries.approve_requests', 'beneficiaries', 'الموافقة على طلبات المستفيدين'),
('beneficiaries.view_loans', 'beneficiaries', 'عرض القروض'),
('beneficiaries.manage_loans', 'beneficiaries', 'إدارة القروض'),
('beneficiaries.view_payments', 'beneficiaries', 'عرض المدفوعات'),
('beneficiaries.process_payments', 'beneficiaries', 'معالجة المدفوعات'),
('beneficiaries.export', 'beneficiaries', 'تصدير بيانات المستفيدين'),
('beneficiaries.view_activity_log', 'beneficiaries', 'عرض سجل النشاط')
ON CONFLICT (name) DO NOTHING;

-- Properties Permissions
INSERT INTO public.permissions (name, category, description) VALUES
('properties.view', 'properties', 'عرض العقارات'),
('properties.add', 'properties', 'إضافة عقار'),
('properties.edit', 'properties', 'تعديل بيانات العقار'),
('properties.delete', 'properties', 'حذف عقار'),
('properties.view_contracts', 'properties', 'عرض العقود'),
('properties.add_contract', 'properties', 'إضافة عقد'),
('properties.edit_contract', 'properties', 'تعديل عقد'),
('properties.delete_contract', 'properties', 'حذف عقد'),
('properties.view_maintenance', 'properties', 'عرض طلبات الصيانة'),
('properties.manage_maintenance', 'properties', 'إدارة طلبات الصيانة'),
('properties.view_rentals', 'properties', 'عرض الإيجارات'),
('properties.process_rental_payments', 'properties', 'معالجة مدفوعات الإيجار'),
('properties.view_reports', 'properties', 'عرض تقارير العقارات'),
('properties.export', 'properties', 'تصدير بيانات العقارات'),
('properties.manage_units', 'properties', 'إدارة الوحدات العقارية')
ON CONFLICT (name) DO NOTHING;

-- Archive Permissions
INSERT INTO public.permissions (name, category, description) VALUES
('archive.view', 'archive', 'عرض الأرشيف'),
('archive.add_document', 'archive', 'إضافة مستند'),
('archive.edit_document', 'archive', 'تعديل مستند'),
('archive.delete_document', 'archive', 'حذف مستند'),
('archive.add_folder', 'archive', 'إضافة مجلد'),
('archive.edit_folder', 'archive', 'تعديل مجلد'),
('archive.delete_folder', 'archive', 'حذف مجلد'),
('archive.search', 'archive', 'البحث في الأرشيف'),
('archive.download', 'archive', 'تحميل المستندات'),
('archive.view_versions', 'archive', 'عرض إصدارات المستندات')
ON CONFLICT (name) DO NOTHING;

-- Reports Permissions
INSERT INTO public.permissions (name, category, description) VALUES
('reports.view', 'reports', 'عرض التقارير'),
('reports.create', 'reports', 'إنشاء تقرير'),
('reports.schedule', 'reports', 'جدولة التقارير'),
('reports.export', 'reports', 'تصدير التقارير'),
('reports.customize_dashboard', 'reports', 'تخصيص لوحة التحكم'),
('reports.view_analytics', 'reports', 'عرض التحليلات'),
('reports.view_financial', 'reports', 'عرض التقارير المالية'),
('reports.view_operational', 'reports', 'عرض التقارير التشغيلية')
ON CONFLICT (name) DO NOTHING;

-- Admin Permissions
INSERT INTO public.permissions (name, category, description) VALUES
('admin.manage_users', 'admin', 'إدارة المستخدمين'),
('admin.manage_roles', 'admin', 'إدارة الأدوار'),
('admin.manage_permissions', 'admin', 'إدارة الصلاحيات'),
('admin.view_audit_logs', 'admin', 'عرض سجلات التدقيق'),
('admin.manage_system_settings', 'admin', 'إدارة إعدادات النظام'),
('admin.view_system_health', 'admin', 'عرض حالة النظام'),
('admin.manage_backups', 'admin', 'إدارة النسخ الاحتياطية'),
('admin.manage_integrations', 'admin', 'إدارة التكاملات'),
('admin.view_system_alerts', 'admin', 'عرض تنبيهات النظام'),
('admin.manage_notifications', 'admin', 'إدارة الإشعارات')
ON CONFLICT (name) DO NOTHING;

-- 1.7 إعداد الصلاحيات الافتراضية للأدوار

-- Nazer - صلاحيات كاملة
INSERT INTO public.role_permissions (role, permission_id, granted)
SELECT 'nazer', id, true FROM public.permissions
ON CONFLICT (role, permission_id) DO UPDATE SET granted = true;

-- Admin - صلاحيات كاملة
INSERT INTO public.role_permissions (role, permission_id, granted)
SELECT 'admin', id, true FROM public.permissions
ON CONFLICT (role, permission_id) DO UPDATE SET granted = true;

-- Accountant - صلاحيات محاسبية
INSERT INTO public.role_permissions (role, permission_id, granted)
SELECT 'accountant', id, true FROM public.permissions
WHERE category IN ('accounting', 'funds', 'reports')
  AND name NOT IN ('accounting.delete_journal_entry', 'accounting.close_period', 'funds.approve_level_3')
ON CONFLICT (role, permission_id) DO UPDATE SET granted = true;

-- Cashier - صلاحيات الصرف
INSERT INTO public.role_permissions (role, permission_id, granted)
SELECT 'cashier', id, true FROM public.permissions
WHERE name IN (
  'beneficiaries.view',
  'beneficiaries.view_payments',
  'beneficiaries.process_payments',
  'accounting.view_journal_entries',
  'accounting.add_journal_entry',
  'reports.view',
  'reports.view_financial'
)
ON CONFLICT (role, permission_id) DO UPDATE SET granted = true;

-- Archivist - صلاحيات الأرشيف
INSERT INTO public.role_permissions (role, permission_id, granted)
SELECT 'archivist', id, true FROM public.permissions
WHERE category = 'archive'
ON CONFLICT (role, permission_id) DO UPDATE SET granted = true;

-- Beneficiary - صلاحيات محدودة
INSERT INTO public.role_permissions (role, permission_id, granted)
SELECT 'beneficiary', id, true FROM public.permissions
WHERE name IN (
  'beneficiaries.view_payments',
  'beneficiaries.view_requests',
  'reports.view'
)
ON CONFLICT (role, permission_id) DO UPDATE SET granted = true;

-- Triggers for updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_permissions_updated_at ON public.permissions;
CREATE TRIGGER update_permissions_updated_at
BEFORE UPDATE ON public.permissions
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_role_permissions_updated_at ON public.role_permissions;
CREATE TRIGGER update_role_permissions_updated_at
BEFORE UPDATE ON public.role_permissions
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_permissions_updated_at ON public.user_permissions;
CREATE TRIGGER update_user_permissions_updated_at
BEFORE UPDATE ON public.user_permissions
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();