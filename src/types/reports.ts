/**
 * أنواع التقارير المخصصة - ملف توافقي
 * @deprecated استخدم @/types/reports/index.ts بدلاً من هذا الملف
 * 
 * هذا الملف موجود للتوافق مع الكود القديم فقط
 * جميع الأنواع الآن في @/types/reports/index.ts
 */

export {
  type ReportFilterValue as FilterValue,
  type ReportFilter,
  type CustomReportFilter,
  type ReportColumn,
  type CustomReport,
} from './reports/index';
