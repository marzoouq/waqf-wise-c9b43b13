-- إضافة RLS policies للجداول الجديدة
ALTER TABLE historical_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE opening_balances ENABLE ROW LEVEL SECURITY;
ALTER TABLE heir_distributions ENABLE ROW LEVEL SECURITY;