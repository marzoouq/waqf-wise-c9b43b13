/**
 * Property Hooks - خطافات العقارات
 * @version 2.6.38
 */

export { useProperties, type Property } from './useProperties';
export { useContracts, type Contract } from './useContracts';
export { useRentalPayments, type RentalPayment } from './useRentalPayments';
export { usePropertyUnits } from './usePropertyUnits';
export { usePropertiesDialogs } from './usePropertiesDialogs';
export { usePropertiesStats } from './usePropertiesStats';
export { useMaintenanceProviders } from './useMaintenanceProviders';
export { useMaintenanceRequests, type MaintenanceRequest } from './useMaintenanceRequests';
export { useMaintenanceSchedules } from './useMaintenanceSchedules';

// Tenants
export { useTenants, useTenant } from './useTenants';
export { useTenantLedger, useTenantsAging, useRecordInvoiceToLedger, useRecordPaymentToLedger } from './useTenantLedger';
