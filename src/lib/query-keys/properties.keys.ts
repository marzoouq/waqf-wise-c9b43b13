/**
 * Properties & Contracts Query Keys - مفاتيح استعلامات العقارات والعقود
 */

export const PROPERTIES_KEYS = {
  // Properties
  PROPERTIES: ['properties'] as const,
  PROPERTY: (id: string) => ['property', id] as const,
  PROPERTY_STATS: ['property-stats'] as const,
  PROPERTY_UNITS: (propertyId: string) => ['property-units', propertyId] as const,
  PROPERTY_UNITS_DATA: (propertyId: string) => ['property-units-data', propertyId] as const,
  PROPERTIES_REPORT: ['properties-report'] as const,
  PROPERTIES_STATS: ['properties-stats'] as const,
  PROPERTIES_STATS_ALT: ['properties-stats'] as const,
  PROPERTIES_PERFORMANCE: ['properties-performance'] as const,
  PROPERTY_STATS_COMBINED: ['property-stats-combined'] as const,

  // Contracts
  CONTRACTS: ['contracts'] as const,
  CONTRACT: (id: string) => ['contract', id] as const,
  
  // Tenants
  TENANTS: ['tenants'] as const,
  TENANT: (id: string) => ['tenant', id] as const,
  TENANT_LEDGER: ['tenant-ledger'] as const,
  TENANT_LEDGER_BY_ID: (tenantId: string) => ['tenant-ledger', tenantId] as const,
  TENANT_RECEIPTS: ['tenant-receipts'] as const,
  TENANTS_AGING: ['tenants-aging'] as const,

  // Rental Payments
  RENTAL_PAYMENTS: ['rental_payments'] as const,
  RENTAL_PAYMENTS_BY_CONTRACT: (contractId: string) => ['rental_payments', contractId] as const,
  RENTAL_PAYMENTS_COLLECTED: ['rental-payments-collected'] as const,
  RENTAL_PAYMENTS_WITH_FREQUENCY: ['rental-payments-with-frequency'] as const,

  // Maintenance
  MAINTENANCE_REQUESTS: ['maintenance-requests'] as const,
  MAINTENANCE_REQUEST: (id: string) => ['maintenance-request', id] as const,
  MAINTENANCE_PROVIDERS: ['maintenance-providers'] as const,
  MAINTENANCE_SCHEDULES: ['maintenance-schedules'] as const,
  MAINTENANCE_REQUESTS_DATA: ['maintenance_requests'] as const,
  MAINTENANCE_COST_ANALYSIS: ['maintenance-cost-analysis'] as const,
  MAINTENANCE_TYPE_ANALYSIS: ['maintenance-type-analysis'] as const,

  // Waqf
  WAQF_SUMMARY: ['waqf-summary'] as const,
  WAQF_UNITS: ['waqf-units'] as const,
  WAQF_REVENUE: (waqfUnitId?: string, fiscalYearId?: string) => ['waqf_revenue', waqfUnitId, fiscalYearId] as const,
  WAQF_BUDGETS: (fiscalYearId?: string) => ['waqf-budgets', fiscalYearId] as const,
  WAQF_RESERVES: ['waqf-reserves'] as const,
} as const;
