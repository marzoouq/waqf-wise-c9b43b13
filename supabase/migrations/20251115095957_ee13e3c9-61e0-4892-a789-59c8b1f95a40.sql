-- Fix Security Definer View Issue
-- Set security_invoker for recent_activities view to ensure proper RLS enforcement

ALTER VIEW recent_activities SET (security_invoker = true);
ALTER VIEW recent_activities SET (security_barrier = true);

COMMENT ON VIEW recent_activities IS 'View for recent activities from audit_logs with security_invoker enabled to enforce caller RLS policies';