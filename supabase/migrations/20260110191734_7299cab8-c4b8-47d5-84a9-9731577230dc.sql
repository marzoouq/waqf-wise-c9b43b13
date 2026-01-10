-- إنشاء جدول رسائل الدعم
CREATE TABLE IF NOT EXISTS public.support_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ticket_id UUID REFERENCES public.support_tickets(id) ON DELETE CASCADE,
  sender_id UUID,
  sender_type TEXT DEFAULT 'user' CHECK (sender_type IN ('user', 'staff', 'system')),
  message TEXT NOT NULL,
  attachments JSONB DEFAULT '[]',
  is_internal BOOLEAN DEFAULT false,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- إنشاء جدول التكاملات العامة
CREATE TABLE IF NOT EXISTS public.integrations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  provider TEXT,
  configuration JSONB DEFAULT '{}',
  credentials JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  last_sync_at TIMESTAMPTZ,
  sync_status TEXT DEFAULT 'idle',
  error_message TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID
);

-- إنشاء جدول التقارير المجدولة
CREATE TABLE IF NOT EXISTS public.scheduled_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  report_name TEXT NOT NULL,
  report_type TEXT NOT NULL,
  schedule_type TEXT NOT NULL CHECK (schedule_type IN ('daily', 'weekly', 'monthly', 'quarterly', 'yearly')),
  schedule_config JSONB DEFAULT '{}',
  recipients JSONB DEFAULT '[]',
  filters JSONB DEFAULT '{}',
  format TEXT DEFAULT 'pdf' CHECK (format IN ('pdf', 'excel', 'csv')),
  is_active BOOLEAN DEFAULT true,
  last_run_at TIMESTAMPTZ,
  next_run_at TIMESTAMPTZ,
  last_run_status TEXT,
  last_run_error TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID
);

-- تفعيل RLS
ALTER TABLE public.support_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scheduled_reports ENABLE ROW LEVEL SECURITY;

-- سياسات support_messages
CREATE POLICY "Authenticated users can view support messages" 
ON public.support_messages FOR SELECT 
USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can create support messages" 
ON public.support_messages FOR INSERT 
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Staff can update support messages" 
ON public.support_messages FOR UPDATE 
USING (auth.role() = 'authenticated');

-- سياسات integrations
CREATE POLICY "Admins can view integrations" 
ON public.integrations FOR SELECT 
USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can manage integrations" 
ON public.integrations FOR ALL 
USING (auth.role() = 'authenticated');

-- سياسات scheduled_reports
CREATE POLICY "Authenticated users can view scheduled reports" 
ON public.scheduled_reports FOR SELECT 
USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can manage scheduled reports" 
ON public.scheduled_reports FOR ALL 
USING (auth.role() = 'authenticated');

-- Indexes
CREATE INDEX IF NOT EXISTS idx_support_messages_ticket ON public.support_messages(ticket_id);
CREATE INDEX IF NOT EXISTS idx_support_messages_created ON public.support_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_integrations_type ON public.integrations(type);
CREATE INDEX IF NOT EXISTS idx_scheduled_reports_next_run ON public.scheduled_reports(next_run_at);