-- ===================================
-- نظام موافقات الطلبات متعدد المستويات
-- ===================================

-- إنشاء جدول موافقات الطلبات
CREATE TABLE IF NOT EXISTS public.request_approvals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID NOT NULL REFERENCES public.beneficiary_requests(id) ON DELETE CASCADE,
  level INTEGER NOT NULL CHECK (level IN (1, 2, 3)),
  approver_id UUID REFERENCES auth.users(id),
  approver_name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'معلق' CHECK (status IN ('معلق', 'موافق', 'مرفوض')),
  notes TEXT,
  approved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(request_id, level)
);

-- تفعيل RLS
ALTER TABLE public.request_approvals ENABLE ROW LEVEL SECURITY;

-- سياسات الوصول
CREATE POLICY "Authenticated users can view request approvals"
  ON public.request_approvals FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can manage request approvals"
  ON public.request_approvals FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- إضافة Trigger لتحديث updated_at
CREATE TRIGGER update_request_approvals_updated_at
  BEFORE UPDATE ON public.request_approvals
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger للتحقق من الموافقات واعتماد الطلب
CREATE OR REPLACE FUNCTION public.check_request_approvals()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_all_approved BOOLEAN;
  v_request_id UUID;
  v_any_rejected BOOLEAN;
BEGIN
  v_request_id := NEW.request_id;
  
  -- التحقق من وجود رفض
  SELECT EXISTS(
    SELECT 1 FROM request_approvals
    WHERE request_id = v_request_id AND status = 'مرفوض'
  ) INTO v_any_rejected;
  
  IF v_any_rejected THEN
    UPDATE beneficiary_requests
    SET status = 'مرفوض'
    WHERE id = v_request_id;
    RETURN NEW;
  END IF;
  
  -- التحقق من اكتمال جميع الموافقات (3 مستويات)
  SELECT COUNT(*) = 3 AND COUNT(*) FILTER (WHERE status = 'موافق') = 3
  INTO v_all_approved
  FROM request_approvals
  WHERE request_id = v_request_id;
  
  -- تحديث حالة الطلب
  IF v_all_approved THEN
    UPDATE beneficiary_requests
    SET status = 'موافق عليه'
    WHERE id = v_request_id;
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_check_request_approvals
  AFTER INSERT OR UPDATE ON public.request_approvals
  FOR EACH ROW
  EXECUTE FUNCTION public.check_request_approvals();

-- ===================================
-- جدول إحصائيات الموافقات
-- ===================================

CREATE TABLE IF NOT EXISTS public.approval_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_date DATE NOT NULL DEFAULT CURRENT_DATE,
  pending_approvals INTEGER DEFAULT 0,
  approved_count INTEGER DEFAULT 0,
  rejected_count INTEGER DEFAULT 0,
  avg_approval_time_hours NUMERIC(10,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(report_date)
);

-- تفعيل RLS
ALTER TABLE public.approval_stats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Everyone can view approval stats"
  ON public.approval_stats FOR SELECT
  USING (true);

-- ===================================
-- إضافة فهارس للأداء
-- ===================================

CREATE INDEX IF NOT EXISTS idx_request_approvals_request_id 
  ON public.request_approvals(request_id);

CREATE INDEX IF NOT EXISTS idx_request_approvals_status 
  ON public.request_approvals(status);

CREATE INDEX IF NOT EXISTS idx_request_approvals_level 
  ON public.request_approvals(level);

-- ===================================
-- تعليقات توضيحية
-- ===================================

COMMENT ON TABLE public.request_approvals IS 'نظام موافقات الطلبات متعدد المستويات: مشرف -> مدير -> ناظر';
COMMENT ON COLUMN public.request_approvals.level IS '1: مشرف، 2: مدير، 3: ناظر';
COMMENT ON COLUMN public.request_approvals.status IS 'معلق، موافق، مرفوض';