-- تنظيف شامل للتطبيق من جميع البيانات

-- 1. حذف جميع بنود القيود المحاسبية
DELETE FROM journal_entry_lines;

-- 2. حذف جميع القيود المحاسبية
DELETE FROM journal_entries;

-- 3. حذف جميع الدفعات الإيجارية
DELETE FROM rental_payments;

-- 4. حذف جميع مرفقات العقود
DELETE FROM contract_attachments;

-- 5. حذف جميع تجديدات العقود
DELETE FROM contract_renewals;

-- 6. حذف جميع العقود
DELETE FROM contracts;

-- 7. حذف جميع طلبات الصيانة
DELETE FROM maintenance_requests;

-- 8. حذف جميع وحدات العقارات
DELETE FROM property_units WHERE property_id IS NOT NULL;

-- 9. حذف جميع العقارات
DELETE FROM properties;

-- 10. حذف جميع الموافقات
DELETE FROM payment_approvals;
DELETE FROM loan_approvals;
DELETE FROM distribution_approvals;
DELETE FROM request_approvals;

-- 11. حذف جميع المدفوعات
DELETE FROM payments;

-- 12. حذف جميع أقساط القروض
DELETE FROM loan_installments;
DELETE FROM loan_payments;

-- 13. حذف جميع القروض
DELETE FROM loans;

-- 14. حذف جميع التوزيعات
DELETE FROM distribution_details;
DELETE FROM distributions;

-- 15. حذف جميع الطلبات
DELETE FROM request_comments;
DELETE FROM request_attachments;
DELETE FROM beneficiary_requests;

-- 16. حذف مرفقات المستفيدين
DELETE FROM beneficiary_attachments;

-- 17. حذف سجل نشاط المستفيدين
DELETE FROM beneficiary_activity_log;

-- 18. حذف أعضاء العائلات
DELETE FROM family_members;

-- 19. حذف العائلات
DELETE FROM families;

-- 20. حذف المستفيدين
DELETE FROM beneficiaries;

-- 21. حذف الفواتير
DELETE FROM invoice_lines;
DELETE FROM invoices;

-- 22. حذف الرسائل الداخلية
DELETE FROM internal_messages;

-- 23. حذف الإشعارات
DELETE FROM notifications;

-- 24. حذف البيانات المصرفية
DELETE FROM bank_transactions;
DELETE FROM bank_statements;

-- 25. إعادة تعيين أرصدة الحسابات البنكية
UPDATE bank_accounts SET current_balance = 0;

-- 26. إعادة تعيين أرصدة الحسابات المحاسبية
UPDATE accounts SET current_balance = 0 WHERE is_header = false;

-- 27. حذف الموازنات
DELETE FROM budgets;

-- 28. حذف التدفقات النقدية
DELETE FROM cash_flows;

-- تنظيف مكتمل - جميع البيانات التشغيلية تم حذفها
-- تم الاحتفاظ فقط بـ:
-- - شجرة الحسابات المحاسبية
-- - إعدادات النظام
-- - المستخدمين والأدوار
-- - الهيكل الأساسي للقاعدة