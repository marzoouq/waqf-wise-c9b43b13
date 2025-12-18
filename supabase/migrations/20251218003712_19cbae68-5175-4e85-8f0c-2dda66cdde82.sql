-- تصحيح: تحديث رصيد حساب ضريبة القيمة المضافة المستحقة (2.1.3)
UPDATE accounts
SET current_balance = current_balance + 13043.48
WHERE code = '2.1.3';