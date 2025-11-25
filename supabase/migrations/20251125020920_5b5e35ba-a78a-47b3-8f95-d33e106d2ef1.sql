-- ✅ إضافة إعدادات Error Tracking القابلة للتخصيص
INSERT INTO public.system_settings (setting_key, setting_value, setting_type, category, description) VALUES
  ('error_tracker_dedup_window_minutes', '15', 'number', 'error_tracking', 'نافذة إلغاء التكرار بالدقائق'),
  ('error_tracker_max_same_error', '20', 'number', 'error_tracking', 'الحد الأقصى لنفس الخطأ'),
  ('error_tracker_max_consecutive_errors', '10', 'number', 'error_tracking', 'الحد الأقصى للأخطاء المتتالية'),
  ('error_tracker_auto_resolve_hours', '24', 'number', 'error_tracking', 'وقت الحل التلقائي بالساعات'),
  ('error_tracker_circuit_breaker_timeout', '60', 'number', 'error_tracking', 'مهلة Circuit Breaker بالثواني'),
  ('cron_old_errors_threshold_hours', '24', 'number', 'error_tracking', 'حد الأخطاء القديمة للتنظيف التلقائي'),
  ('cron_duplicate_alerts_window_hours', '1', 'number', 'error_tracking', 'نافذة التنبيهات المكررة للتنظيف')
ON CONFLICT (setting_key) DO UPDATE SET
  setting_value = EXCLUDED.setting_value,
  updated_at = now();