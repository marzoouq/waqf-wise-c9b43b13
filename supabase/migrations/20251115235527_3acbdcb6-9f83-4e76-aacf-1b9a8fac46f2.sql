-- إنشاء جدول موافقات القروض
CREATE TABLE IF NOT EXISTS public.loan_approvals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  loan_id UUID NOT NULL REFERENCES public.loans(id) ON DELETE CASCADE,
  level INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'معلق',
  approver_name TEXT NOT NULL,
  approver_id UUID REFERENCES auth.users(id),
  notes TEXT,
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- إنشاء جدول موافقات المدفوعات
CREATE TABLE IF NOT EXISTS public.payment_approvals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_id UUID NOT NULL REFERENCES public.payments(id) ON DELETE CASCADE,
  level INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'معلق',
  approver_name TEXT NOT NULL,
  approver_id UUID REFERENCES auth.users(id),
  notes TEXT,
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- إنشاء جدول سجل الموافقات
CREATE TABLE IF NOT EXISTS public.approval_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  approval_type TEXT NOT NULL,
  approval_id UUID NOT NULL,
  reference_id UUID NOT NULL,
  action TEXT NOT NULL,
  performed_by UUID REFERENCES auth.users(id),
  performed_by_name TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- إنشاء indexes لتحسين الأداء
CREATE INDEX IF NOT EXISTS idx_loan_approvals_loan_id ON public.loan_approvals(loan_id);
CREATE INDEX IF NOT EXISTS idx_loan_approvals_status ON public.loan_approvals(status);
CREATE INDEX IF NOT EXISTS idx_payment_approvals_payment_id ON public.payment_approvals(payment_id);
CREATE INDEX IF NOT EXISTS idx_payment_approvals_status ON public.payment_approvals(status);
CREATE INDEX IF NOT EXISTS idx_approval_history_reference_id ON public.approval_history(reference_id);
CREATE INDEX IF NOT EXISTS idx_approval_history_approval_type ON public.approval_history(approval_type);

-- تفعيل RLS
ALTER TABLE public.loan_approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.approval_history ENABLE ROW LEVEL SECURITY;

-- سياسات RLS لموافقات القروض
CREATE POLICY "المسؤولون والمحاسبون يمكنهم رؤية موافقات القروض"
  ON public.loan_approvals FOR SELECT
  USING (
    has_role(auth.uid(), 'admin'::app_role) OR 
    has_role(auth.uid(), 'nazer'::app_role) OR 
    has_role(auth.uid(), 'accountant'::app_role) OR
    has_role(auth.uid(), 'cashier'::app_role)
  );

CREATE POLICY "المسؤولون والمحاسبون يمكنهم إدارة موافقات القروض"
  ON public.loan_approvals FOR ALL
  USING (
    has_role(auth.uid(), 'admin'::app_role) OR 
    has_role(auth.uid(), 'nazer'::app_role) OR 
    has_role(auth.uid(), 'accountant'::app_role)
  );

-- سياسات RLS لموافقات المدفوعات
CREATE POLICY "المسؤولون والمحاسبون يمكنهم رؤية موافقات المدفوعات"
  ON public.payment_approvals FOR SELECT
  USING (
    has_role(auth.uid(), 'admin'::app_role) OR 
    has_role(auth.uid(), 'nazer'::app_role) OR 
    has_role(auth.uid(), 'accountant'::app_role) OR
    has_role(auth.uid(), 'cashier'::app_role)
  );

CREATE POLICY "المسؤولون والمحاسبون يمكنهم إدارة موافقات المدفوعات"
  ON public.payment_approvals FOR ALL
  USING (
    has_role(auth.uid(), 'admin'::app_role) OR 
    has_role(auth.uid(), 'nazer'::app_role) OR 
    has_role(auth.uid(), 'accountant'::app_role)
  );

-- سياسات RLS لسجل الموافقات
CREATE POLICY "المسؤولون يمكنهم رؤية سجل الموافقات"
  ON public.approval_history FOR SELECT
  USING (
    has_role(auth.uid(), 'admin'::app_role) OR 
    has_role(auth.uid(), 'nazer'::app_role) OR 
    has_role(auth.uid(), 'accountant'::app_role)
  );

CREATE POLICY "النظام يمكنه إضافة سجل الموافقات"
  ON public.approval_history FOR INSERT
  WITH CHECK (true);

-- إنشاء trigger للتحقق من اكتمال موافقات القروض
CREATE OR REPLACE FUNCTION check_loan_approvals()
RETURNS TRIGGER AS $$
DECLARE
  v_all_approved BOOLEAN;
  v_loan_id UUID;
  v_any_rejected BOOLEAN;
BEGIN
  v_loan_id := NEW.loan_id;
  
  -- التحقق من وجود رفض
  SELECT EXISTS(
    SELECT 1 FROM loan_approvals
    WHERE loan_id = v_loan_id AND status = 'مرفوض'
  ) INTO v_any_rejected;
  
  IF v_any_rejected THEN
    UPDATE loans
    SET status = 'rejected'
    WHERE id = v_loan_id;
    RETURN NEW;
  END IF;
  
  -- التحقق من اكتمال جميع الموافقات
  SELECT COUNT(*) >= 2 AND COUNT(*) FILTER (WHERE status = 'موافق') = COUNT(*)
  INTO v_all_approved
  FROM loan_approvals
  WHERE loan_id = v_loan_id;
  
  -- تحديث حالة القرض
  IF v_all_approved THEN
    UPDATE loans
    SET status = 'approved'
    WHERE id = v_loan_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_check_loan_approvals
  AFTER INSERT OR UPDATE ON public.loan_approvals
  FOR EACH ROW
  EXECUTE FUNCTION check_loan_approvals();

-- إنشاء trigger للتحقق من اكتمال موافقات المدفوعات
CREATE OR REPLACE FUNCTION check_payment_approvals()
RETURNS TRIGGER AS $$
DECLARE
  v_all_approved BOOLEAN;
  v_payment_id UUID;
  v_any_rejected BOOLEAN;
BEGIN
  v_payment_id := NEW.payment_id;
  
  -- التحقق من وجود رفض
  SELECT EXISTS(
    SELECT 1 FROM payment_approvals
    WHERE payment_id = v_payment_id AND status = 'مرفوض'
  ) INTO v_any_rejected;
  
  IF v_any_rejected THEN
    UPDATE payments
    SET status = 'rejected'
    WHERE id = v_payment_id;
    RETURN NEW;
  END IF;
  
  -- التحقق من اكتمال جميع الموافقات
  SELECT COUNT(*) >= 2 AND COUNT(*) FILTER (WHERE status = 'موافق') = COUNT(*)
  INTO v_all_approved
  FROM payment_approvals
  WHERE payment_id = v_payment_id;
  
  -- تحديث حالة المدفوعة
  IF v_all_approved THEN
    UPDATE payments
    SET status = 'completed'
    WHERE id = v_payment_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_check_payment_approvals
  AFTER INSERT OR UPDATE ON public.payment_approvals
  FOR EACH ROW
  EXECUTE FUNCTION check_payment_approvals();