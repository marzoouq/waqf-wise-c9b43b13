-- ============================================
-- Phase 2 Forensic Audit: Final Hardening Migration (v2)
-- Fix: Use DROP IF EXISTS before CREATE
-- ============================================

-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS prevent_delete_unit_handovers ON public.unit_handovers;
DROP TRIGGER IF EXISTS protect_created_at_unit_handovers ON public.unit_handovers;

-- Recreate triggers safely
CREATE TRIGGER prevent_delete_unit_handovers
BEFORE DELETE ON public.unit_handovers
FOR EACH ROW EXECUTE FUNCTION prevent_hard_delete_financial();

CREATE TRIGGER protect_created_at_unit_handovers
BEFORE UPDATE ON public.unit_handovers
FOR EACH ROW EXECUTE FUNCTION protect_created_at();