/**
 * System Query Keys - مفاتيح استعلامات النظام والإعدادات
 */

export const SYSTEM_KEYS = {
  // System Settings & Health
  SYSTEM_SETTINGS: ['system-settings'] as const,
  SYSTEM_HEALTH: ['system-health'] as const,
  SYSTEM_HEALTH_LIVE: ['system-health-live'] as const,
  SYSTEM_STATS: ['system-stats'] as const,
  SYSTEM_PERFORMANCE_METRICS: ['system-performance-metrics'] as const,
  USERS_ACTIVITY_METRICS: ['users-activity-metrics'] as const,
  SYSTEM_ERROR_LOGS: ['system-error-logs'] as const,
  SYSTEM_ALERTS: ['system-alerts'] as const,
  SYSTEM_ERRORS: (severity?: string, status?: string) => ['system-errors', severity, status] as const,
  RECENT_ERRORS: ['recent-errors'] as const,
  ACTIVE_ALERTS: ['active-alerts'] as const,
  FIX_ATTEMPTS: ['fix-attempts'] as const,
  
  // Audit & Logs
  AUDIT_LOGS: ['audit-logs'] as const,
  ACTIVITIES: ['activities'] as const,
  ERROR_LOGS: ['error-logs'] as const,

  // Organization
  ORGANIZATION_SETTINGS: ['organization-settings'] as const,
  TRIBES: ['tribes'] as const,
  FAMILIES: ['families'] as const,

  // Notifications
  NOTIFICATIONS: ['notifications'] as const,
  NOTIFICATION_SETTINGS: ['notification-settings'] as const,
  UNREAD_NOTIFICATIONS: ['unread-notifications'] as const,
  
  // Messages
  MESSAGES: ['messages'] as const,
  UNREAD_MESSAGES: ['unread-messages'] as const,
  INTERNAL_MESSAGES: ['internal_messages'] as const,
  
  // Backup
  BACKUP_LOGS: ['backup-logs'] as const,
  BACKUP_SCHEDULES: ['backup-schedules'] as const,

  // Integrations
  PAYMENT_GATEWAYS: ['payment-gateways'] as const,
  GOVERNMENT_INTEGRATIONS: ['government-integrations'] as const,

  // Archive & Documents
  DOCUMENTS: ['documents'] as const,
  DOCUMENT: (id: string) => ['document', id] as const,
  ARCHIVE_STATS: ['archive-stats'] as const,
  ARCHIVIST_STATS: ['archivist-stats'] as const,
  RECENT_DOCUMENTS: (category: string, searchTerm: string) => ['recent-documents', category, searchTerm] as const,
  FOLDERS: ['folders'] as const,
  DOCUMENT_TAGS: (documentId?: string) => ['document-tags', documentId] as const,
  DOCUMENT_VERSIONS: (documentId: string) => ['document-versions', documentId] as const,

  // Reports
  REPORTS: ['reports'] as const,
  REPORT: (id: string) => ['report', id] as const,
  REPORT_TEMPLATES: (reportType?: string) => ['report_templates', reportType] as const,
  CUSTOM_REPORTS: ['custom-reports'] as const,
  SCHEDULED_REPORTS: ['scheduled-reports'] as const,
  ANNUAL_DISCLOSURES: ['annual-disclosures'] as const,
  ANNUAL_DISCLOSURE_CURRENT: ['annual-disclosure-current'] as const,
  DISCLOSURE_BENEFICIARIES: (disclosureId?: string) => ['disclosure-beneficiaries', disclosureId] as const,
  DISCLOSURE_DOCUMENTS: (disclosureId?: string) => ['disclosure-documents', disclosureId] as const,
  SMART_DISCLOSURE_DOCUMENTS: (disclosureId?: string) => ['smart-disclosure-documents', disclosureId] as const,

  // Knowledge Base
  KB_ARTICLES: ['kb-articles'] as const,
  KB_FAQS: ['kb-faqs'] as const,
  KB_ARTICLES_FEATURED: ['kb-articles', 'featured'] as const,
  KB_ARTICLE: (id: string) => ['kb-article', id] as const,
  KNOWLEDGE_ARTICLES: ['knowledge-articles'] as const,
  KNOWLEDGE_ARTICLES_LIST: ['knowledge-articles'] as const,
  KNOWLEDGE_FAQS: ['knowledge-faqs'] as const,
  PROJECT_PHASES: ['project-phases'] as const,
  PROJECT_DOCUMENTATION: (category?: string) => ['project-documentation', category] as const,
  PHASE_CHANGELOG: (phaseId: string) => ['phase-changelog', phaseId] as const,
  
  // Search
  SEARCH_HISTORY: (searchType?: string) => ['search-history', searchType] as const,
  RECENT_SEARCHES: (searchType: string) => ['recent-searches', searchType] as const,
  SAVED_SEARCHES: ['saved-searches'] as const,
  GLOBAL_SEARCH_BENEFICIARIES: (query: string) => ['global-search-beneficiaries', query] as const,
  GLOBAL_SEARCH_PROPERTIES: (query: string) => ['global-search-properties', query] as const,
  GLOBAL_SEARCH_LOANS: (query: string) => ['global-search-loans', query] as const,
  GLOBAL_SEARCH_DOCUMENTS: (query: string) => ['global-search-documents', query] as const,
  
  // Translations
  TRANSLATIONS: ['translations'] as const,
  
  // Tasks
  TASKS: ['tasks'] as const,

  // Waqf Units
  WAQF_UNITS: ['waqf_units'] as const,
  WAQF_UNIT: (id: string) => ['waqf_unit', id] as const,

  // Live Performance & Monitoring
  LIVE_PERFORMANCE: ['live-performance'] as const,
  LIVE_METRICS: ['live-metrics'] as const,

  // Saved Filters (Factory Pattern)
  SAVED_FILTERS: (type: string) => ['saved-filters', type] as const,
  SAVED_FILTER: (type: string, id: string) => ['saved-filter', type, id] as const,
} as const;
