-- Resolve noisy recurring alerts for placeholder message
UPDATE public.system_alerts
SET status = 'resolved',
    resolved_at = now(),
    resolution_notes = 'Auto-resolved: placeholder message noise'
WHERE status = 'active'
  AND alert_type = 'recurring_error'
  AND description LIKE '%No message provided%';

-- Optional: mark matching error logs as resolved to reduce dashboard noise
UPDATE public.system_error_logs
SET status = 'resolved',
    resolved_at = now(),
    resolution_notes = 'Auto-resolved: missing message placeholder'
WHERE status = 'new'
  AND error_message = 'No message provided';