/**
 * Code Splitting - Lazy Loading للصفحات
 * تحميل الصفحات فقط عند الحاجة لتحسين الأداء
 */

import { lazy } from 'react';

// Admin Pages
export const Dashboard = lazy(() => import('./pages/Dashboard'));
export const NazerDashboard = lazy(() => import('./pages/NazerDashboard'));
export const AccountantDashboard = lazy(() => import('./pages/AccountantDashboard'));
export const CashierDashboard = lazy(() => import('./pages/CashierDashboard'));
export const ArchivistDashboard = lazy(() => import('./pages/ArchivistDashboard'));

// Main Pages
export const Beneficiaries = lazy(() => import('./pages/Beneficiaries'));
export const Families = lazy(() => import('./pages/Families'));
export const Properties = lazy(() => import('./pages/Properties'));
export const WaqfUnits = lazy(() => import('./pages/WaqfUnits'));
export const Funds = lazy(() => import('./pages/Funds'));
export const Accounting = lazy(() => import('./pages/Accounting'));
export const Invoices = lazy(() => import('./pages/Invoices'));
export const Loans = lazy(() => import('./pages/Loans'));
export const Payments = lazy(() => import('./pages/Payments'));
export const Archive = lazy(() => import('./pages/Archive'));
export const Approvals = lazy(() => import('./pages/Approvals'));
export const Reports = lazy(() => import('./pages/Reports'));
export const AuditLogs = lazy(() => import('./pages/AuditLogs'));
export const Users = lazy(() => import('./pages/Users'));
export const StaffRequests = lazy(() => import('./pages/StaffRequests'));
export const AIInsights = lazy(() => import('./pages/AIInsights'));
export const Settings = lazy(() => import('./pages/Settings'));
export const Notifications = lazy(() => import('./pages/Notifications'));

// User Pages
export const BeneficiaryDashboard = lazy(() => import('./pages/BeneficiaryDashboard'));
export const BeneficiaryProfile = lazy(() => import('./pages/BeneficiaryProfile'));

// Auth
export const Auth = lazy(() => import('./pages/Auth'));

// Special
export const NotFound = lazy(() => import('./pages/NotFound'));
export const Install = lazy(() => import('./pages/Install'));
