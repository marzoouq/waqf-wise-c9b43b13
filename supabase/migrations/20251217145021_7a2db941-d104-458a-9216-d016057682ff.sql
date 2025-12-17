-- إنشاء Cron Job للتقرير الأسبوعي (كل يوم أحد الساعة 9 صباحاً)
SELECT cron.schedule(
  'weekly-report-generation',
  '0 9 * * 0', -- كل أحد 9:00 صباحاً
  $$
  SELECT net.http_post(
    url := current_setting('app.settings.supabase_url') || '/functions/v1/weekly-report',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key')
    ),
    body := '{}'::jsonb
  );
  $$
);