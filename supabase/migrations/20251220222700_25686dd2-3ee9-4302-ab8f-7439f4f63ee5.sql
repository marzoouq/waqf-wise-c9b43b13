-- جدول تقارير الفحص الذكي بالـ AI
CREATE TABLE public.ai_system_audits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  audit_type TEXT NOT NULL DEFAULT 'full' CHECK (audit_type IN ('full', 'category', 'scheduled')),
  categories JSONB DEFAULT '[]'::jsonb,
  findings JSONB NOT NULL DEFAULT '[]'::jsonb,
  auto_fixes_applied JSONB DEFAULT '[]'::jsonb,
  pending_fixes JSONB DEFAULT '[]'::jsonb,
  ai_analysis TEXT,
  severity_summary JSONB DEFAULT '{"critical": 0, "warning": 0, "info": 0, "success": 0}'::jsonb,
  slack_notified BOOLEAN DEFAULT FALSE,
  total_issues INTEGER DEFAULT 0,
  fixed_issues INTEGER DEFAULT 0,
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- جدول الإصلاحات المعلقة
CREATE TABLE public.pending_system_fixes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  audit_id UUID REFERENCES public.ai_system_audits(id) ON DELETE CASCADE,
  fix_type TEXT NOT NULL,
  category TEXT NOT NULL,
  fix_sql TEXT NOT NULL,
  description TEXT,
  severity TEXT DEFAULT 'warning' CHECK (severity IN ('critical', 'warning', 'info')),
  auto_fixable BOOLEAN DEFAULT FALSE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'applied', 'rejected', 'rolled_back')),
  rollback_sql TEXT,
  error_message TEXT,
  approved_by UUID,
  applied_at TIMESTAMPTZ,
  rolled_back_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.ai_system_audits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pending_system_fixes ENABLE ROW LEVEL SECURITY;

-- RLS Policies for ai_system_audits
CREATE POLICY "ai_system_audits_select" ON public.ai_system_audits
  FOR SELECT USING (is_admin_or_nazer());

CREATE POLICY "ai_system_audits_insert" ON public.ai_system_audits
  FOR INSERT WITH CHECK (is_admin_or_nazer());

CREATE POLICY "ai_system_audits_update" ON public.ai_system_audits
  FOR UPDATE USING (is_admin_or_nazer());

CREATE POLICY "ai_system_audits_delete" ON public.ai_system_audits
  FOR DELETE USING (is_admin());

-- RLS Policies for pending_system_fixes
CREATE POLICY "pending_system_fixes_select" ON public.pending_system_fixes
  FOR SELECT USING (is_admin_or_nazer());

CREATE POLICY "pending_system_fixes_insert" ON public.pending_system_fixes
  FOR INSERT WITH CHECK (is_admin_or_nazer());

CREATE POLICY "pending_system_fixes_update" ON public.pending_system_fixes
  FOR UPDATE USING (is_admin_or_nazer());

CREATE POLICY "pending_system_fixes_delete" ON public.pending_system_fixes
  FOR DELETE USING (is_admin());

-- Create indexes for better performance
CREATE INDEX idx_ai_system_audits_created_at ON public.ai_system_audits(created_at DESC);
CREATE INDEX idx_ai_system_audits_audit_type ON public.ai_system_audits(audit_type);
CREATE INDEX idx_pending_system_fixes_audit_id ON public.pending_system_fixes(audit_id);
CREATE INDEX idx_pending_system_fixes_status ON public.pending_system_fixes(status);
CREATE INDEX idx_pending_system_fixes_severity ON public.pending_system_fixes(severity);