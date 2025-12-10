/**
 * Barrel exports for all hooks
 * تصدير مركزي لجميع الـ Hooks
 * 
 * يمكن الاستيراد من:
 * 1. المجلد الرئيسي: @/hooks
 * 2. المجلدات الفرعية حسب الفئة:
 *    - @/hooks/auth - المصادقة والأمان
 *    - @/hooks/beneficiary - المستفيدين
 *    - @/hooks/accounting - المحاسبة
 *    - @/hooks/property - العقارات
 *    - @/hooks/distributions - التوزيعات
 *    - @/hooks/payments - المدفوعات
 *    - @/hooks/notifications - الإشعارات
 *    - @/hooks/requests - الطلبات
 *    - @/hooks/reports - التقارير
 *    - @/hooks/archive - الأرشيف
 *    - @/hooks/dashboard - لوحات التحكم
 *    - @/hooks/system - النظام
 *    - @/hooks/users - المستخدمين
 *    - @/hooks/messages - الرسائل
 *    - @/hooks/support - الدعم الفني
 *    - @/hooks/ai - الذكاء الاصطناعي
 *    - @/hooks/governance - الحوكمة
 *    - @/hooks/ui - واجهة المستخدم
 * 
 * @version 2.8.60
 * @lastUpdate 2025-12-10
 */

// ==================== UI & Utility ====================
export * from './ui';

// ==================== Auth & Security ====================
export * from './auth';

// ==================== Beneficiary ====================
export * from './beneficiary';

// ==================== Accounting ====================
export * from './accounting';

// ==================== Fiscal Years ====================
export * from './fiscal-years';

// ==================== Distribution ====================
export * from './distributions';

// ==================== Property ====================
export * from './property';

// ==================== Payments & Banking ====================
export * from './payments';

// ==================== Notifications ====================
export * from './notifications';

// ==================== Dashboard & KPIs ====================
export * from './dashboard';

// ==================== Admin ====================
export * from './admin';

// ==================== System ====================
export * from './system';

// ==================== Users ====================
export * from './users';

// ==================== Messages ====================
export * from './messages';

// ==================== Support ====================
export * from './support';

// ==================== AI ====================
export * from './ai';

// ==================== Governance ====================
export * from './governance';

// ==================== Archive ====================
export * from './archive';

// ==================== Reports ====================
export * from './reports';

// ==================== Requests ====================
export * from './requests';

// ==================== Security ====================
export * from './security';

// ==================== Settings ====================
export * from './settings';

// ==================== Performance ====================
export * from './performance';

// ==================== Transactions ====================
export * from './transactions';

// ==================== Developer ====================
export * from './developer';

// ==================== Loans ====================
export * from './loans';

// ==================== Nazer ====================
export * from './nazer';

// ==================== Permissions ====================
export * from './permissions';

// Note: approvals exports omitted to avoid conflicts with distributions/requests
