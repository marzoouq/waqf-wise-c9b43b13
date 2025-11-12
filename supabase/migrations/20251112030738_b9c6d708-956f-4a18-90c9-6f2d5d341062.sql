-- إعادة إنشاء Triggers المفقودة

-- Trigger 1: تحديث total_members تلقائياً
DROP TRIGGER IF EXISTS trg_update_family_members_count ON family_members;
CREATE TRIGGER trg_update_family_members_count
AFTER INSERT OR DELETE ON family_members
FOR EACH ROW EXECUTE FUNCTION update_family_members_count();

-- Trigger 2: توليد رقم الطلب تلقائياً
DROP TRIGGER IF EXISTS trg_generate_request_number ON beneficiary_requests;
CREATE TRIGGER trg_generate_request_number
BEFORE INSERT ON beneficiary_requests
FOR EACH ROW EXECUTE FUNCTION generate_request_number();

-- Trigger 3: حساب SLA تلقائياً
DROP TRIGGER IF EXISTS trg_calculate_request_sla ON beneficiary_requests;
CREATE TRIGGER trg_calculate_request_sla
BEFORE INSERT OR UPDATE ON beneficiary_requests
FOR EACH ROW EXECUTE FUNCTION calculate_request_sla();

-- Trigger 4-6: تحديث updated_at تلقائياً
DROP TRIGGER IF EXISTS update_families_updated_at ON families;
CREATE TRIGGER update_families_updated_at 
BEFORE UPDATE ON families 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_family_members_updated_at ON family_members;
CREATE TRIGGER update_family_members_updated_at 
BEFORE UPDATE ON family_members 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_beneficiary_requests_updated_at ON beneficiary_requests;
CREATE TRIGGER update_beneficiary_requests_updated_at 
BEFORE UPDATE ON beneficiary_requests 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();