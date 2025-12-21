
-- حذف فهارس غير مستخدمة ولا تضيف قيمة
-- نحذف فقط الفهارس المكررة أو غير المفيدة

-- 1. فهارس على جداول صغيرة جداً (أقل من 10 صفوف) ولا تُستخدم
-- idx_families_tribe - جدول families به صف واحد فقط
DROP INDEX IF EXISTS idx_families_tribe;

-- idx_families_created_at - لا فائدة منه مع صف واحد
DROP INDEX IF EXISTS idx_families_created_at;

-- idx_dashboards_created_by - جدول dashboards فارغ
DROP INDEX IF EXISTS idx_dashboards_created_by;

-- 2. فهارس مركبة غير مستخدمة على جداول صغيرة
-- idx_je_date_status - journal_entries به 4 صفوف فقط
DROP INDEX IF EXISTS idx_je_date_status;

-- idx_je_posted - مكرر مع idx_je_date_status من ناحية المفهوم
DROP INDEX IF EXISTS idx_je_posted;

-- 3. فهارس على جداول المهام الصغيرة (6 صفوف)
DROP INDEX IF EXISTS idx_tasks_due_date;
DROP INDEX IF EXISTS idx_tasks_priority;
DROP INDEX IF EXISTS idx_tasks_created_at;
DROP INDEX IF EXISTS idx_tasks_created_by;
DROP INDEX IF EXISTS idx_tasks_assigned_to;

-- 4. فهارس مركبة غير مستخدمة
DROP INDEX IF EXISTS idx_ben_cat_status;
DROP INDEX IF EXISTS idx_dist_date_status;
DROP INDEX IF EXISTS idx_inv_date_status;

-- 5. فهارس على جداول الموافقات غير المستخدمة
DROP INDEX IF EXISTS idx_approval_type_status;
DROP INDEX IF EXISTS idx_approval_pending;

-- 6. فهارس رسائل غير مستخدمة
DROP INDEX IF EXISTS idx_msg_recipient;
DROP INDEX IF EXISTS idx_msg_sender;
DROP INDEX IF EXISTS idx_msg_read;

-- 7. فهارس أخرى غير مستخدمة
DROP INDEX IF EXISTS idx_activities_user_name;
DROP INDEX IF EXISTS idx_bt_matched;
DROP INDEX IF EXISTS idx_loan_active;
DROP INDEX IF EXISTS idx_saved_reports_user_id;
DROP INDEX IF EXISTS idx_dashboard_widgets_dashboard_id;
