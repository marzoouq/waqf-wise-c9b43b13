-- إنشاء الجداول المفقودة

-- 1. جدول بنود الميزانية
CREATE TABLE IF NOT EXISTS public.budget_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  budget_id UUID REFERENCES public.budgets(id) ON DELETE CASCADE,
  account_id UUID REFERENCES public.accounts(id),
  category VARCHAR(100) NOT NULL,
  description TEXT,
  planned_amount DECIMAL(15,2) NOT NULL DEFAULT 0,
  actual_amount DECIMAL(15,2) DEFAULT 0,
  variance DECIMAL(15,2) GENERATED ALWAYS AS (planned_amount - COALESCE(actual_amount, 0)) STORED,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. جدول تعليقات التذاكر
CREATE TABLE IF NOT EXISTS public.ticket_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID REFERENCES public.support_tickets(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  user_name VARCHAR(255),
  content TEXT NOT NULL,
  is_internal BOOLEAN DEFAULT false,
  attachments JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. جدول الرسائل
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID REFERENCES auth.users(id),
  recipient_id UUID,
  beneficiary_id UUID REFERENCES public.beneficiaries(id),
  subject VARCHAR(500),
  content TEXT NOT NULL,
  message_type VARCHAR(50) DEFAULT 'general',
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMPTZ,
  priority VARCHAR(20) DEFAULT 'normal',
  attachments JSONB DEFAULT '[]',
  parent_message_id UUID REFERENCES public.messages(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- تفعيل RLS
ALTER TABLE public.budget_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ticket_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- سياسات budget_items
CREATE POLICY "budget_items_staff_all" ON public.budget_items
  FOR ALL USING (is_financial_staff());

CREATE POLICY "budget_items_heirs_view" ON public.budget_items
  FOR SELECT USING (has_full_read_access());

-- سياسات ticket_comments
CREATE POLICY "ticket_comments_staff_all" ON public.ticket_comments
  FOR ALL USING (has_staff_access());

CREATE POLICY "ticket_comments_own" ON public.ticket_comments
  FOR SELECT USING (auth.uid() = user_id);

-- سياسات messages
CREATE POLICY "messages_staff_all" ON public.messages
  FOR ALL USING (has_staff_access());

CREATE POLICY "messages_own_sender" ON public.messages
  FOR ALL USING (auth.uid() = sender_id);

CREATE POLICY "messages_own_recipient" ON public.messages
  FOR SELECT USING (auth.uid() = recipient_id);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_budget_items_budget ON public.budget_items(budget_id);
CREATE INDEX IF NOT EXISTS idx_ticket_comments_ticket ON public.ticket_comments(ticket_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender ON public.messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_recipient ON public.messages(recipient_id);
CREATE INDEX IF NOT EXISTS idx_messages_beneficiary ON public.messages(beneficiary_id);