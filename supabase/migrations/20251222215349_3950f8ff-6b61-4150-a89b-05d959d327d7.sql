
-- دالة حذف البيانات التجريبية
CREATE OR REPLACE FUNCTION public.cleanup_test_data()
RETURNS TABLE(table_name TEXT, deleted_count BIGINT) 
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_count BIGINT;
BEGIN
  DELETE FROM support_tickets WHERE ticket_number LIKE 'TKT-TEST-%'; GET DIAGNOSTICS v_count = ROW_COUNT; table_name := 'support_tickets'; deleted_count := v_count; RETURN NEXT;
  DELETE FROM governance_board_members WHERE board_id = 'e0000001-0001-0001-0001-000000000001'; GET DIAGNOSTICS v_count = ROW_COUNT; table_name := 'governance_board_members'; deleted_count := v_count; RETURN NEXT;
  DELETE FROM governance_boards WHERE board_code LIKE 'BOD-TEST-%'; GET DIAGNOSTICS v_count = ROW_COUNT; table_name := 'governance_boards'; deleted_count := v_count; RETURN NEXT;
  DELETE FROM maintenance_requests WHERE request_number LIKE 'MR-TEST-%'; GET DIAGNOSTICS v_count = ROW_COUNT; table_name := 'maintenance_requests'; deleted_count := v_count; RETURN NEXT;
  DELETE FROM invoices WHERE invoice_number LIKE 'INV-TEST-%'; GET DIAGNOSTICS v_count = ROW_COUNT; table_name := 'invoices'; deleted_count := v_count; RETURN NEXT;
  DELETE FROM loans WHERE loan_number LIKE 'LOAN-TEST-%'; GET DIAGNOSTICS v_count = ROW_COUNT; table_name := 'loans'; deleted_count := v_count; RETURN NEXT;
  DELETE FROM distributions WHERE notes LIKE '%تجريبي%'; GET DIAGNOSTICS v_count = ROW_COUNT; table_name := 'distributions'; deleted_count := v_count; RETURN NEXT;
  RETURN;
END; $$;

COMMENT ON FUNCTION public.cleanup_test_data() IS 'حذف البيانات التجريبية: SELECT * FROM cleanup_test_data();';

-- الفهارس
CREATE INDEX IF NOT EXISTS idx_governance_boards_status ON public.governance_boards(status);
CREATE INDEX IF NOT EXISTS idx_support_tickets_status ON public.support_tickets(status);
CREATE INDEX IF NOT EXISTS idx_maintenance_requests_status ON public.maintenance_requests(status);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON public.invoices(status);
CREATE INDEX IF NOT EXISTS idx_loans_status ON public.loans(status);
CREATE INDEX IF NOT EXISTS idx_distributions_status ON public.distributions(status);
