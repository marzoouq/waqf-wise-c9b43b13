-- حذف الجداول المكررة فقط

-- 1. حذف جدول scheduled_reports (مكرر مع scheduled_report_jobs)
DROP TABLE IF EXISTS public.scheduled_reports CASCADE;

-- 2. حذف جدول login_attempts (مكرر مع login_attempts_log)
DROP TABLE IF EXISTS public.login_attempts CASCADE;