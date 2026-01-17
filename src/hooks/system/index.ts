/**
 * System Hooks - خطافات النظام
 */

export { useSystemHealth } from './useSystemHealth';
export { useSystemHealthIndicator, type HealthIndicatorStatus, type HealthIndicatorDetails } from './useSystemHealthIndicator';
export { useAdminAlerts, type SystemAlert } from './useAdminAlerts';
export { logErrorToSupport } from './useGlobalErrorLogging';
export { useSystemMonitoring } from './useSystemMonitoring';
export { useSystemSettings } from './useSystemSettings';
export { useSystemPerformanceMetrics } from './useSystemPerformanceMetrics';
export { useUsersActivityMetrics } from './useUsersActivityMetrics';
export { useBackup } from './useBackup';
export { useSelfHealing } from './useSelfHealing';
export { useAlertCleanup } from './useAlertCleanup';
export { useSecurityAlerts } from './useSecurityAlerts';
export { useAuditLogs } from './useAuditLogs';
export { useAuditLogsEnhanced, useAuditLogsStats, useAuditLogDetails, useAuditLogTables, useAuditLogUsers } from './useAuditLogsEnhanced';
export { useAuditAlerts, useAuditAlertsStats, useRealtimeAuditAlerts } from './useAuditAlerts';
export { useIntegrationsData } from './useIntegrationsData';
export { useSystemErrorLogsData } from './useSystemErrorLogsData';
export { useSelfHealingStats } from './useSelfHealingStats';
export { useAbortableEdgeFunction } from './useAbortableEdgeFunction';
export { useConnectionMonitor, type ConnectionEvent, type ConnectionStats } from './useConnectionMonitor';
