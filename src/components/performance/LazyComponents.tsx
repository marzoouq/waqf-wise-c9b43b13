/**
 * Lazy-loaded components للصفحات الثقيلة
 * تحسين الأداء عبر تحميل كسول للمكونات
 */

import { lazy } from 'react';

// صفحات Dashboard
export const LazyNazerDashboard = lazy(() => import('@/pages/NazerDashboard'));
export const LazyAccountantDashboard = lazy(() => import('@/pages/AccountantDashboard'));
export const LazyCashierDashboard = lazy(() => import('@/pages/CashierDashboard'));
export const LazyArchivistDashboard = lazy(() => import('@/pages/ArchivistDashboard'));
export const LazyBeneficiaryDashboard = lazy(() => import('@/pages/BeneficiaryDashboard'));

// صفحات المحاسبة
export const LazyAccounting = lazy(() => import('@/pages/Accounting'));
export const LazyBankTransfers = lazy(() => import('@/pages/BankTransfers'));
export const LazyAllTransactions = lazy(() => import('@/pages/AllTransactions'));

// صفحات التقارير
export const LazyReports = lazy(() => import('@/pages/Reports'));

// صفحات الأرشفة
export const LazyArchive = lazy(() => import('@/pages/Archive'));

// صفحات الإعدادات
export const LazySettings = lazy(() => import('@/pages/Settings'));
export const LazyUsers = lazy(() => import('@/pages/Users'));
