-- إنشاء مهمة cron للصيانة الأسبوعية
-- تشغيل كل يوم أحد الساعة 3 صباحاً

-- التأكد من تفعيل الامتدادات
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- حذف المهمة القديمة إن وجدت
SELECT cron.unschedule('weekly-maintenance') WHERE EXISTS (
  SELECT 1 FROM cron.job WHERE jobname = 'weekly-maintenance'
);

-- إنشاء مهمة الصيانة الأسبوعية
SELECT cron.schedule(
  'weekly-maintenance',
  '0 3 * * 0', -- كل أحد الساعة 3 صباحاً
  $$
  SELECT net.http_post(
    url := 'https://zsacuvrcohmraoldilph.supabase.co/functions/v1/weekly-maintenance',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpzYWN1dnJjb2htcmFvbGRpbHBoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIzNDAxMDgsImV4cCI6MjA3NzkxNjEwOH0.Aiuhsdwn-Xqtm-1IkwGsnny0j4PuzlqA0lXGqTe1WPQ"}'::jsonb,
    body := '{}'::jsonb
  );
  $$
);
