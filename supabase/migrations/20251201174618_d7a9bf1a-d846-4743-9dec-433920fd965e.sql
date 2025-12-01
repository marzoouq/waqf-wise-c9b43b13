CREATE POLICY hist_inv_select ON historical_invoices
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'nazer', 'accountant', 'cashier', 'archivist')
  )
)