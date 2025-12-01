CREATE POLICY open_bal_view ON opening_balances
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'nazer', 'accountant', 'cashier')
  )
)