
-- إضافة أعمدة Soft Delete للجداول المتبقية التي تحتاجها
-- ==========================================

-- 1. payments
ALTER TABLE public.payments 
  ADD COLUMN IF NOT EXISTS deleted_at timestamptz,
  ADD COLUMN IF NOT EXISTS deleted_by uuid,
  ADD COLUMN IF NOT EXISTS deletion_reason text;

-- 2. bank_accounts
ALTER TABLE public.bank_accounts 
  ADD COLUMN IF NOT EXISTS deleted_at timestamptz,
  ADD COLUMN IF NOT EXISTS deleted_by uuid,
  ADD COLUMN IF NOT EXISTS deletion_reason text;

-- 3. payment_schedules
ALTER TABLE public.payment_schedules 
  ADD COLUMN IF NOT EXISTS deleted_at timestamptz,
  ADD COLUMN IF NOT EXISTS deleted_by uuid,
  ADD COLUMN IF NOT EXISTS deletion_reason text;

-- 4. governance_policies
ALTER TABLE public.governance_policies 
  ADD COLUMN IF NOT EXISTS deleted_at timestamptz,
  ADD COLUMN IF NOT EXISTS deleted_by uuid,
  ADD COLUMN IF NOT EXISTS deletion_reason text;

-- 5. governance_boards
ALTER TABLE public.governance_boards 
  ADD COLUMN IF NOT EXISTS deleted_at timestamptz,
  ADD COLUMN IF NOT EXISTS deleted_by uuid,
  ADD COLUMN IF NOT EXISTS deletion_reason text;

-- 6. governance_board_members
ALTER TABLE public.governance_board_members 
  ADD COLUMN IF NOT EXISTS deleted_at timestamptz,
  ADD COLUMN IF NOT EXISTS deleted_by uuid,
  ADD COLUMN IF NOT EXISTS deletion_reason text;

-- 7. internal_messages
ALTER TABLE public.internal_messages 
  ADD COLUMN IF NOT EXISTS deleted_at timestamptz,
  ADD COLUMN IF NOT EXISTS deleted_by uuid,
  ADD COLUMN IF NOT EXISTS deletion_reason text;

-- 8. unit_handovers
ALTER TABLE public.unit_handovers 
  ADD COLUMN IF NOT EXISTS deleted_at timestamptz,
  ADD COLUMN IF NOT EXISTS deleted_by uuid,
  ADD COLUMN IF NOT EXISTS deletion_reason text;

-- 9. contract_notifications
ALTER TABLE public.contract_notifications 
  ADD COLUMN IF NOT EXISTS deleted_at timestamptz,
  ADD COLUMN IF NOT EXISTS deleted_by uuid,
  ADD COLUMN IF NOT EXISTS deletion_reason text;

-- 10. tribes
ALTER TABLE public.tribes 
  ADD COLUMN IF NOT EXISTS deleted_at timestamptz,
  ADD COLUMN IF NOT EXISTS deleted_by uuid,
  ADD COLUMN IF NOT EXISTS deletion_reason text;

-- 11. auto_journal_templates
ALTER TABLE public.auto_journal_templates 
  ADD COLUMN IF NOT EXISTS deleted_at timestamptz,
  ADD COLUMN IF NOT EXISTS deleted_by uuid,
  ADD COLUMN IF NOT EXISTS deletion_reason text;

-- 12. report_templates
ALTER TABLE public.report_templates 
  ADD COLUMN IF NOT EXISTS deleted_at timestamptz,
  ADD COLUMN IF NOT EXISTS deleted_by uuid,
  ADD COLUMN IF NOT EXISTS deletion_reason text;

-- 13. historical_rental_details
ALTER TABLE public.historical_rental_details 
  ADD COLUMN IF NOT EXISTS deleted_at timestamptz,
  ADD COLUMN IF NOT EXISTS deleted_by uuid,
  ADD COLUMN IF NOT EXISTS deletion_reason text;

-- 14. chatbot_conversations
ALTER TABLE public.chatbot_conversations 
  ADD COLUMN IF NOT EXISTS deleted_at timestamptz,
  ADD COLUMN IF NOT EXISTS deleted_by uuid,
  ADD COLUMN IF NOT EXISTS deletion_reason text;

-- إنشاء indexes للأداء
CREATE INDEX IF NOT EXISTS idx_payments_deleted_at ON public.payments(deleted_at);
CREATE INDEX IF NOT EXISTS idx_bank_accounts_deleted_at ON public.bank_accounts(deleted_at);
CREATE INDEX IF NOT EXISTS idx_governance_policies_deleted_at ON public.governance_policies(deleted_at);
CREATE INDEX IF NOT EXISTS idx_governance_boards_deleted_at ON public.governance_boards(deleted_at);
CREATE INDEX IF NOT EXISTS idx_internal_messages_deleted_at ON public.internal_messages(deleted_at);
CREATE INDEX IF NOT EXISTS idx_unit_handovers_deleted_at ON public.unit_handovers(deleted_at);
CREATE INDEX IF NOT EXISTS idx_contract_notifications_deleted_at ON public.contract_notifications(deleted_at);
CREATE INDEX IF NOT EXISTS idx_tribes_deleted_at ON public.tribes(deleted_at);

-- ==========================================
-- تطبيق Triggers لمنع الحذف الفيزيائي
-- ==========================================

-- payments
DROP TRIGGER IF EXISTS prevent_delete_payments ON public.payments;
CREATE TRIGGER prevent_delete_payments
  BEFORE DELETE ON public.payments
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_hard_delete_financial();

-- bank_accounts
DROP TRIGGER IF EXISTS prevent_delete_bank_accounts ON public.bank_accounts;
CREATE TRIGGER prevent_delete_bank_accounts
  BEFORE DELETE ON public.bank_accounts
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_hard_delete_financial();

-- payment_schedules
DROP TRIGGER IF EXISTS prevent_delete_payment_schedules ON public.payment_schedules;
CREATE TRIGGER prevent_delete_payment_schedules
  BEFORE DELETE ON public.payment_schedules
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_hard_delete_financial();

-- governance_policies
DROP TRIGGER IF EXISTS prevent_delete_governance_policies ON public.governance_policies;
CREATE TRIGGER prevent_delete_governance_policies
  BEFORE DELETE ON public.governance_policies
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_hard_delete_financial();

-- governance_boards
DROP TRIGGER IF EXISTS prevent_delete_governance_boards ON public.governance_boards;
CREATE TRIGGER prevent_delete_governance_boards
  BEFORE DELETE ON public.governance_boards
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_hard_delete_financial();

-- governance_board_members
DROP TRIGGER IF EXISTS prevent_delete_governance_board_members ON public.governance_board_members;
CREATE TRIGGER prevent_delete_governance_board_members
  BEFORE DELETE ON public.governance_board_members
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_hard_delete_financial();

-- internal_messages
DROP TRIGGER IF EXISTS prevent_delete_internal_messages ON public.internal_messages;
CREATE TRIGGER prevent_delete_internal_messages
  BEFORE DELETE ON public.internal_messages
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_hard_delete_financial();

-- unit_handovers
DROP TRIGGER IF EXISTS prevent_delete_unit_handovers ON public.unit_handovers;
CREATE TRIGGER prevent_delete_unit_handovers
  BEFORE DELETE ON public.unit_handovers
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_hard_delete_financial();

-- contract_notifications
DROP TRIGGER IF EXISTS prevent_delete_contract_notifications ON public.contract_notifications;
CREATE TRIGGER prevent_delete_contract_notifications
  BEFORE DELETE ON public.contract_notifications
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_hard_delete_financial();

-- tribes
DROP TRIGGER IF EXISTS prevent_delete_tribes ON public.tribes;
CREATE TRIGGER prevent_delete_tribes
  BEFORE DELETE ON public.tribes
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_hard_delete_financial();

-- auto_journal_templates
DROP TRIGGER IF EXISTS prevent_delete_auto_journal_templates ON public.auto_journal_templates;
CREATE TRIGGER prevent_delete_auto_journal_templates
  BEFORE DELETE ON public.auto_journal_templates
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_hard_delete_financial();

-- report_templates
DROP TRIGGER IF EXISTS prevent_delete_report_templates ON public.report_templates;
CREATE TRIGGER prevent_delete_report_templates
  BEFORE DELETE ON public.report_templates
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_hard_delete_financial();

-- historical_rental_details
DROP TRIGGER IF EXISTS prevent_delete_historical_rental_details ON public.historical_rental_details;
CREATE TRIGGER prevent_delete_historical_rental_details
  BEFORE DELETE ON public.historical_rental_details
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_hard_delete_financial();

-- chatbot_conversations
DROP TRIGGER IF EXISTS prevent_delete_chatbot_conversations ON public.chatbot_conversations;
CREATE TRIGGER prevent_delete_chatbot_conversations
  BEFORE DELETE ON public.chatbot_conversations
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_hard_delete_financial();

-- ==========================================
-- تطبيق Triggers لحماية created_at
-- ==========================================

DROP TRIGGER IF EXISTS protect_created_at_payments ON public.payments;
CREATE TRIGGER protect_created_at_payments
  BEFORE UPDATE ON public.payments
  FOR EACH ROW
  EXECUTE FUNCTION public.protect_created_at();

DROP TRIGGER IF EXISTS protect_created_at_bank_accounts ON public.bank_accounts;
CREATE TRIGGER protect_created_at_bank_accounts
  BEFORE UPDATE ON public.bank_accounts
  FOR EACH ROW
  EXECUTE FUNCTION public.protect_created_at();

DROP TRIGGER IF EXISTS protect_created_at_governance_policies ON public.governance_policies;
CREATE TRIGGER protect_created_at_governance_policies
  BEFORE UPDATE ON public.governance_policies
  FOR EACH ROW
  EXECUTE FUNCTION public.protect_created_at();

DROP TRIGGER IF EXISTS protect_created_at_governance_boards ON public.governance_boards;
CREATE TRIGGER protect_created_at_governance_boards
  BEFORE UPDATE ON public.governance_boards
  FOR EACH ROW
  EXECUTE FUNCTION public.protect_created_at();

DROP TRIGGER IF EXISTS protect_created_at_internal_messages ON public.internal_messages;
CREATE TRIGGER protect_created_at_internal_messages
  BEFORE UPDATE ON public.internal_messages
  FOR EACH ROW
  EXECUTE FUNCTION public.protect_created_at();

DROP TRIGGER IF EXISTS protect_created_at_unit_handovers ON public.unit_handovers;
CREATE TRIGGER protect_created_at_unit_handovers
  BEFORE UPDATE ON public.unit_handovers
  FOR EACH ROW
  EXECUTE FUNCTION public.protect_created_at();
