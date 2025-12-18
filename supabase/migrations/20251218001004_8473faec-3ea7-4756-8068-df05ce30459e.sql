-- إنشاء جدول تنبيهات العقارات
CREATE TABLE IF NOT EXISTS public.property_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID REFERENCES public.properties(id) ON DELETE CASCADE,
  contract_id UUID REFERENCES public.contracts(id) ON DELETE SET NULL,
  alert_type TEXT NOT NULL CHECK (alert_type IN ('contract_expiring', 'maintenance_due', 'payment_overdue', 'low_occupancy', 'contract_expired', 'rent_overdue')),
  severity TEXT NOT NULL DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  action_url TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  is_resolved BOOLEAN DEFAULT false,
  resolved_at TIMESTAMPTZ,
  resolved_by UUID,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- إنشاء فهارس
CREATE INDEX IF NOT EXISTS idx_property_alerts_property ON public.property_alerts(property_id);
CREATE INDEX IF NOT EXISTS idx_property_alerts_type ON public.property_alerts(alert_type);
CREATE INDEX IF NOT EXISTS idx_property_alerts_resolved ON public.property_alerts(is_resolved);
CREATE INDEX IF NOT EXISTS idx_property_alerts_severity ON public.property_alerts(severity);
CREATE INDEX IF NOT EXISTS idx_property_alerts_created ON public.property_alerts(created_at DESC);

-- تفعيل RLS
ALTER TABLE public.property_alerts ENABLE ROW LEVEL SECURITY;

-- سياسات RLS
CREATE POLICY "Staff can view all property alerts"
ON public.property_alerts FOR SELECT
USING (public.is_staff_only());

CREATE POLICY "Staff can create property alerts"
ON public.property_alerts FOR INSERT
WITH CHECK (public.is_staff_only());

CREATE POLICY "Staff can update property alerts"
ON public.property_alerts FOR UPDATE
USING (public.is_staff_only());

CREATE POLICY "Staff can delete property alerts"
ON public.property_alerts FOR DELETE
USING (public.is_admin_or_nazer());

-- Trigger لتحديث updated_at
CREATE TRIGGER update_property_alerts_updated_at
  BEFORE UPDATE ON public.property_alerts
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- إضافة تعليق للجدول
COMMENT ON TABLE public.property_alerts IS 'جدول تنبيهات العقارات - يخزن تنبيهات انتهاء العقود والصيانة والمدفوعات';

-- تفعيل Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.property_alerts;