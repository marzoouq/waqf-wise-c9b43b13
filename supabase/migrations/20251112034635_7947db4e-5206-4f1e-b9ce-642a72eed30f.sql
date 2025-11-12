-- المرحلة الثانية: إدارة المستفيدين المتقدمة

-- 1. جدول تصنيفات المستفيدين
CREATE TABLE IF NOT EXISTS public.beneficiary_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT,
  color TEXT DEFAULT '#3b82f6',
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 2. جدول سجل النشاط للمستفيدين
CREATE TABLE IF NOT EXISTS public.beneficiary_activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  beneficiary_id UUID NOT NULL REFERENCES public.beneficiaries(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL, -- 'created', 'updated', 'deleted', 'status_changed', 'payment_received', 'document_added'
  action_description TEXT NOT NULL,
  old_values JSONB,
  new_values JSONB,
  performed_by UUID REFERENCES auth.users(id),
  performed_by_name TEXT,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 3. جدول مرفقات المستفيدين
CREATE TABLE IF NOT EXISTS public.beneficiary_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  beneficiary_id UUID NOT NULL REFERENCES public.beneficiaries(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_type TEXT NOT NULL, -- 'identity', 'birth_certificate', 'marriage_certificate', 'bank_document', 'medical', 'other'
  file_size INTEGER,
  mime_type TEXT,
  description TEXT,
  uploaded_by UUID REFERENCES auth.users(id),
  uploaded_by_name TEXT,
  is_verified BOOLEAN DEFAULT false,
  verified_by UUID REFERENCES auth.users(id),
  verified_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 4. جدول البحث المحفوظ
CREATE TABLE IF NOT EXISTS public.saved_searches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  search_criteria JSONB NOT NULL,
  is_favorite BOOLEAN DEFAULT false,
  usage_count INTEGER DEFAULT 0,
  last_used_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 5. تحديث جدول المستفيدين بحقول إضافية
ALTER TABLE public.beneficiaries 
  ADD COLUMN IF NOT EXISTS tribe TEXT,
  ADD COLUMN IF NOT EXISTS priority_level INTEGER DEFAULT 1,
  ADD COLUMN IF NOT EXISTS marital_status TEXT,
  ADD COLUMN IF NOT EXISTS nationality TEXT DEFAULT 'سعودي',
  ADD COLUMN IF NOT EXISTS city TEXT,
  ADD COLUMN IF NOT EXISTS address TEXT,
  ADD COLUMN IF NOT EXISTS date_of_birth DATE,
  ADD COLUMN IF NOT EXISTS gender TEXT,
  ADD COLUMN IF NOT EXISTS bank_name TEXT,
  ADD COLUMN IF NOT EXISTS bank_account_number TEXT,
  ADD COLUMN IF NOT EXISTS iban TEXT,
  ADD COLUMN IF NOT EXISTS monthly_income NUMERIC DEFAULT 0,
  ADD COLUMN IF NOT EXISTS family_size INTEGER DEFAULT 1,
  ADD COLUMN IF NOT EXISTS is_head_of_family BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS parent_beneficiary_id UUID REFERENCES public.beneficiaries(id),
  ADD COLUMN IF NOT EXISTS tags TEXT[];

-- 6. إنشاء الفهارس لتحسين الأداء
CREATE INDEX IF NOT EXISTS idx_beneficiaries_tribe ON public.beneficiaries(tribe);
CREATE INDEX IF NOT EXISTS idx_beneficiaries_category ON public.beneficiaries(category);
CREATE INDEX IF NOT EXISTS idx_beneficiaries_status ON public.beneficiaries(status);
CREATE INDEX IF NOT EXISTS idx_beneficiaries_priority ON public.beneficiaries(priority_level);
CREATE INDEX IF NOT EXISTS idx_beneficiaries_family ON public.beneficiaries(parent_beneficiary_id);
CREATE INDEX IF NOT EXISTS idx_beneficiaries_tags ON public.beneficiaries USING gin(tags);

CREATE INDEX IF NOT EXISTS idx_activity_log_beneficiary ON public.beneficiary_activity_log(beneficiary_id);
CREATE INDEX IF NOT EXISTS idx_activity_log_created ON public.beneficiary_activity_log(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_attachments_beneficiary ON public.beneficiary_attachments(beneficiary_id);
CREATE INDEX IF NOT EXISTS idx_attachments_type ON public.beneficiary_attachments(file_type);

CREATE INDEX IF NOT EXISTS idx_saved_searches_user ON public.saved_searches(user_id);

-- 7. تفعيل RLS على الجداول الجديدة
ALTER TABLE public.beneficiary_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.beneficiary_activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.beneficiary_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_searches ENABLE ROW LEVEL SECURITY;

-- 8. سياسات RLS للتصنيفات
CREATE POLICY "الجميع يمكنهم قراءة التصنيفات"
  ON public.beneficiary_categories FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "المسؤولون يمكنهم إدارة التصنيفات"
  ON public.beneficiary_categories FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'admin'))
  WITH CHECK (has_role(auth.uid(), 'admin'));

-- 9. سياسات RLS لسجل النشاط
CREATE POLICY "الجميع يمكنهم قراءة سجل النشاط"
  ON public.beneficiary_activity_log FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "النظام يمكنه إضافة سجل النشاط"
  ON public.beneficiary_activity_log FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- 10. سياسات RLS للمرفقات
CREATE POLICY "الجميع يمكنهم قراءة المرفقات"
  ON public.beneficiary_attachments FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "الجميع يمكنهم إضافة مرفقات"
  ON public.beneficiary_attachments FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "المسؤولون يمكنهم تحديث المرفقات"
  ON public.beneficiary_attachments FOR UPDATE
  TO authenticated
  USING (has_role(auth.uid(), 'admin'))
  WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "المسؤولون يمكنهم حذف المرفقات"
  ON public.beneficiary_attachments FOR DELETE
  TO authenticated
  USING (has_role(auth.uid(), 'admin'));

-- 11. سياسات RLS للبحث المحفوظ
CREATE POLICY "المستخدمون يمكنهم إدارة بحثهم المحفوظ"
  ON public.saved_searches FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- 12. دالة لتسجيل النشاط تلقائياً
CREATE OR REPLACE FUNCTION public.log_beneficiary_activity()
RETURNS TRIGGER AS $$
DECLARE
  action_desc TEXT;
  user_name TEXT;
BEGIN
  -- الحصول على اسم المستخدم
  SELECT full_name INTO user_name FROM public.profiles WHERE user_id = auth.uid();
  
  IF TG_OP = 'INSERT' THEN
    action_desc := 'تم إضافة مستفيد جديد: ' || NEW.full_name;
    INSERT INTO public.beneficiary_activity_log (
      beneficiary_id, action_type, action_description, new_values, performed_by, performed_by_name
    ) VALUES (
      NEW.id, 'created', action_desc, to_jsonb(NEW), auth.uid(), COALESCE(user_name, 'النظام')
    );
  ELSIF TG_OP = 'UPDATE' THEN
    action_desc := 'تم تحديث بيانات المستفيد: ' || NEW.full_name;
    INSERT INTO public.beneficiary_activity_log (
      beneficiary_id, action_type, action_description, old_values, new_values, performed_by, performed_by_name
    ) VALUES (
      NEW.id, 'updated', action_desc, to_jsonb(OLD), to_jsonb(NEW), auth.uid(), COALESCE(user_name, 'النظام')
    );
  ELSIF TG_OP = 'DELETE' THEN
    action_desc := 'تم حذف المستفيد: ' || OLD.full_name;
    INSERT INTO public.beneficiary_activity_log (
      beneficiary_id, action_type, action_description, old_values, performed_by, performed_by_name
    ) VALUES (
      OLD.id, 'deleted', action_desc, to_jsonb(OLD), auth.uid(), COALESCE(user_name, 'النظام')
    );
  END IF;
  
  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 13. Trigger لتسجيل النشاط
DROP TRIGGER IF EXISTS beneficiary_activity_trigger ON public.beneficiaries;
CREATE TRIGGER beneficiary_activity_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.beneficiaries
  FOR EACH ROW EXECUTE FUNCTION public.log_beneficiary_activity();

-- 14. دالة لتحديث updated_at تلقائياً
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 15. Triggers لتحديث updated_at
DROP TRIGGER IF EXISTS update_beneficiary_categories_updated_at ON public.beneficiary_categories;
CREATE TRIGGER update_beneficiary_categories_updated_at
  BEFORE UPDATE ON public.beneficiary_categories
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_beneficiary_attachments_updated_at ON public.beneficiary_attachments;
CREATE TRIGGER update_beneficiary_attachments_updated_at
  BEFORE UPDATE ON public.beneficiary_attachments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_saved_searches_updated_at ON public.saved_searches;
CREATE TRIGGER update_saved_searches_updated_at
  BEFORE UPDATE ON public.saved_searches
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 16. إضافة بيانات تصنيفات افتراضية
INSERT INTO public.beneficiary_categories (name, description, icon, color, sort_order) VALUES
  ('أسرة محتاجة', 'أسر تحتاج إلى دعم مالي شهري', 'Users', '#ef4444', 1),
  ('أيتام', 'أيتام يحتاجون إلى رعاية خاصة', 'Heart', '#f59e0b', 2),
  ('أرامل', 'أرامل يحتجن إلى دعم مستمر', 'User', '#8b5cf6', 3),
  ('طلاب', 'طلاب علم يحتاجون إلى دعم دراسي', 'GraduationCap', '#3b82f6', 4),
  ('مرضى', 'مرضى يحتاجون إلى دعم علاجي', 'HeartPulse', '#ec4899', 5),
  ('كبار السن', 'كبار السن بحاجة إلى رعاية', 'Users2', '#6366f1', 6),
  ('ذوي الاحتياجات الخاصة', 'ذوي الاحتياجات الخاصة', 'Accessibility', '#14b8a6', 7),
  ('أسر منتجة', 'أسر تحتاج إلى دعم لبدء مشاريع صغيرة', 'Briefcase', '#10b981', 8)
ON CONFLICT (name) DO NOTHING;

COMMENT ON TABLE public.beneficiary_categories IS 'تصنيفات المستفيدين من الوقف';
COMMENT ON TABLE public.beneficiary_activity_log IS 'سجل النشاط والتغييرات على المستفيدين';
COMMENT ON TABLE public.beneficiary_attachments IS 'المرفقات والمستندات الخاصة بالمستفيدين';
COMMENT ON TABLE public.saved_searches IS 'استعلامات البحث المحفوظة للمستخدمين';