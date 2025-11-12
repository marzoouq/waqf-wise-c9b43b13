-- إضافة الـtriggers المفقودة لتسجيل النشاط وتحديث التواريخ

-- Trigger لتحديث updated_at على جدول beneficiaries
CREATE OR REPLACE TRIGGER update_beneficiaries_updated_at
  BEFORE UPDATE ON public.beneficiaries
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger لتسجيل النشاط على جدول beneficiaries
CREATE OR REPLACE TRIGGER log_beneficiary_changes
  AFTER INSERT OR UPDATE OR DELETE ON public.beneficiaries
  FOR EACH ROW
  EXECUTE FUNCTION public.log_beneficiary_activity();

-- Trigger لتحديث updated_at على جدول beneficiary_categories
CREATE OR REPLACE TRIGGER update_beneficiary_categories_updated_at
  BEFORE UPDATE ON public.beneficiary_categories
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger لتحديث updated_at على جدول beneficiary_attachments
CREATE OR REPLACE TRIGGER update_beneficiary_attachments_updated_at
  BEFORE UPDATE ON public.beneficiary_attachments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger لتحديث updated_at على جدول saved_searches
CREATE OR REPLACE TRIGGER update_saved_searches_updated_at
  BEFORE UPDATE ON public.saved_searches
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();