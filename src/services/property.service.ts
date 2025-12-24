/**
 * Property Service - خدمة إدارة العقارات (Facade)
 * 
 * هذا الملف يعمل كـ Facade للتوافق مع الكود القديم
 * الخدمات الفعلية موجودة في مجلد property/
 * 
 * @version 3.1.0
 */

// إعادة تصدير الأنواع والخدمات
export {
  PropertyCoreService,
  PropertyUnitsService,
  PropertyStatsService,
  PropertyMaintenanceService,
  PropertyAlertsService,
  PropertyContractsService,
  type PropertyFilters,
  type PropertyStats,
  type PropertiesFullStats,
  type PropertyAlert,
} from './property/index';

// استيراد الخدمات للاستخدام في الـ Facade
import { PropertyCoreService, type PropertyFilters } from './property/property-core.service';
import { PropertyUnitsService } from './property/property-units.service';
import { PropertyStatsService, type PropertyStats, type PropertiesFullStats } from './property/property-stats.service';
import { PropertyMaintenanceService } from './property/property-maintenance.service';
import { PropertyAlertsService } from './property/property-alerts.service';
import { PropertyContractsService } from './property/property-contracts.service';
import type { Database, Json } from '@/integrations/supabase/types';

type PropertyRow = Database['public']['Tables']['properties']['Row'];
type PropertyInsert = Database['public']['Tables']['properties']['Insert'];

/**
 * PropertyService - Facade للتوافق العكسي
 * يستخدم الخدمات المنفصلة داخلياً
 */
export class PropertyService {
  // ==================== Core Operations ====================
  static getAll = PropertyCoreService.getAll;
  static getById = PropertyCoreService.getById;
  static create = PropertyCoreService.create;
  static update = PropertyCoreService.update;
  static delete = PropertyCoreService.delete;
  static updateOccupancy = PropertyCoreService.updateOccupancy;
  static getByType = PropertyCoreService.getByType;
  static getVacant = PropertyCoreService.getVacant;
  static getUnlinkedToWaqf = PropertyCoreService.getUnlinkedToWaqf;
  static linkToWaqfUnit = PropertyCoreService.linkToWaqfUnit;

  // ==================== Units Operations ====================
  static getUnits = PropertyUnitsService.getUnits;
  static getAllUnits = PropertyUnitsService.getAllUnits;
  static getNextUnitNumber = PropertyUnitsService.getNextUnitNumber;
  static createUnit = PropertyUnitsService.createUnit;
  static updateUnit = PropertyUnitsService.updateUnit;
  static deleteUnit = PropertyUnitsService.deleteUnit;
  static getPropertyUnitsAndContracts = PropertyUnitsService.getPropertyUnitsAndContracts;

  // ==================== Stats Operations ====================
  static getStats = PropertyStatsService.getStats;
  static calculateExpectedRevenue = PropertyStatsService.calculateExpectedRevenue;
  static getPropertiesStats = PropertyStatsService.getPropertiesStats;

  // ==================== Maintenance Operations ====================
  static getMaintenanceRequests = PropertyMaintenanceService.getMaintenanceRequests;
  static getMaintenanceProviders = PropertyMaintenanceService.getMaintenanceProviders;
  static addMaintenanceProvider = PropertyMaintenanceService.addMaintenanceProvider;

  // ==================== Alerts Operations ====================
  static getAlerts = PropertyAlertsService.getAlerts;
  static resolveAlert = PropertyAlertsService.resolveAlert;
  static createAlert = PropertyAlertsService.createAlert;
  static generateSmartAlerts = PropertyAlertsService.generateSmartAlerts;

  // ==================== Contracts Operations ====================
  static getContracts = PropertyContractsService.getContracts;
  static getPayments = PropertyContractsService.getPayments;
  static getRentalPaymentsWithFrequency = PropertyContractsService.getRentalPaymentsWithFrequency;
}
