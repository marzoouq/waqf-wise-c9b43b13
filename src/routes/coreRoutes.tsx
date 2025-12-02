/**
 * المسارات الأساسية للتطبيق
 * Core application routes
 */

import { Route } from "react-router-dom";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import {
  Beneficiaries,
  BeneficiaryProfile,
  Families,
  FamilyDetails,
  Properties,
  Funds,
  WaqfUnits,
  Archive,
  Accounting,
  Budgets,
  Invoices,
  Payments,
  PaymentVouchers,
  Loans,
  BankTransfers,
  AllTransactions,
  Approvals,
  Reports,
  CustomReportsPage,
  Requests,
  StaffRequestsManagement,
  EmergencyAidManagement,
  Support,
  KnowledgeBase,
  Messages,
  GovernanceDecisions,
  DecisionDetails,
  Settings,
  TransparencySettings,
  NotificationSettingsPage,
  Notifications,
  Chatbot,
  NotFound,
} from "./lazyPages";

export const coreRoutes = [
  // المستفيدين
  <Route 
    key="beneficiaries"
    path="/beneficiaries" 
    element={
      <ProtectedRoute requiredRoles={["admin", "nazer", "accountant"]}>
        <Beneficiaries />
      </ProtectedRoute>
    } 
  />,
  <Route 
    key="beneficiaries-profile"
    path="/beneficiaries/:id" 
    element={
      <ProtectedRoute requiredRoles={["admin", "nazer", "accountant", "beneficiary", "waqf_heir"]}>
        <BeneficiaryProfile />
      </ProtectedRoute>
    } 
  />,
  
  // العائلات
  <Route 
    key="families"
    path="/families" 
    element={
      <ProtectedRoute requiredRoles={["admin", "nazer", "accountant"]}>
        <Families />
      </ProtectedRoute>
    } 
  />,
  <Route 
    key="family-details"
    path="/families/:id" 
    element={
      <ProtectedRoute requiredRoles={["admin", "nazer", "accountant"]}>
        <FamilyDetails />
      </ProtectedRoute>
    } 
  />,
  
  // العقارات والأصول
  <Route
    key="properties"
    path="/properties" 
    element={
      <ProtectedRoute requiredRoles={["admin", "nazer", "accountant"]}>
        <Properties />
      </ProtectedRoute>
    } 
  />,
  <Route 
    key="funds"
    path="/funds" 
    element={
      <ProtectedRoute requiredRoles={["admin", "nazer", "accountant"]}>
        <Funds />
      </ProtectedRoute>
    } 
  />,
  <Route 
    key="waqf-units"
    path="/waqf-units" 
    element={
      <ProtectedRoute requiredRoles={["admin", "nazer", "accountant"]}>
        <WaqfUnits />
      </ProtectedRoute>
    } 
  />,
  
  // الأرشيف
  <Route 
    key="archive"
    path="/archive" 
    element={
      <ProtectedRoute requiredRoles={["admin", "nazer", "archivist"]}>
        <Archive />
      </ProtectedRoute>
    } 
  />,
  
  // المحاسبة والمالية
  <Route 
    key="accounting"
    path="/accounting" 
    element={
      <ProtectedRoute requiredRoles={["admin", "nazer", "accountant"]}>
        <Accounting />
      </ProtectedRoute>
    } 
  />,
  <Route 
    key="budgets"
    path="/budgets" 
    element={
      <ProtectedRoute requiredRoles={["admin", "nazer", "accountant"]}>
        <Budgets />
      </ProtectedRoute>
    } 
  />,
  <Route 
    key="invoices"
    path="/invoices" 
    element={
      <ProtectedRoute requiredRoles={["admin", "nazer", "accountant"]}>
        <Invoices />
      </ProtectedRoute>
    } 
  />,
  <Route 
    key="payments"
    path="/payments" 
    element={
      <ProtectedRoute requiredRoles={["admin", "nazer", "accountant", "cashier", "beneficiary", "waqf_heir"]}>
        <Payments />
      </ProtectedRoute>
    } 
  />,
  <Route 
    key="payment-vouchers"
    path="/payment-vouchers" 
    element={
      <ProtectedRoute requiredRoles={["admin", "nazer", "accountant", "cashier"]}>
        <PaymentVouchers />
      </ProtectedRoute>
    } 
  />,
  <Route 
    key="loans"
    path="/loans" 
    element={
      <ProtectedRoute requiredRoles={["admin", "nazer", "accountant"]}>
        <Loans />
      </ProtectedRoute>
    } 
  />,
  <Route 
    key="bank-transfers"
    path="/bank-transfers" 
    element={
      <ProtectedRoute requiredRoles={["admin", "nazer", "accountant"]}>
        <BankTransfers />
      </ProtectedRoute>
    } 
  />,
  <Route 
    key="all-transactions"
    path="/all-transactions" 
    element={
      <ProtectedRoute requiredRoles={["admin", "nazer", "accountant"]}>
        <AllTransactions />
      </ProtectedRoute>
    } 
  />,
  <Route 
    key="approvals"
    path="/approvals" 
    element={
      <ProtectedRoute requiredRoles={["admin", "nazer", "accountant"]}>
        <Approvals />
      </ProtectedRoute>
    } 
  />,
  
  // التقارير
  <Route 
    key="reports"
    path="/reports" 
    element={
      <ProtectedRoute requiredRoles={["admin", "nazer", "accountant"]}>
        <Reports />
      </ProtectedRoute>
    } 
  />,
  <Route 
    key="reports-custom"
    path="/reports/custom" 
    element={
      <ProtectedRoute requiredRoles={["admin", "nazer", "accountant"]}>
        <CustomReportsPage />
      </ProtectedRoute>
    } 
  />,
  
  // الطلبات
  <Route 
    key="requests"
    path="/requests" 
    element={
      <ProtectedRoute requiredRoles={["admin", "nazer", "accountant", "cashier"]}>
        <Requests />
      </ProtectedRoute>
    } 
  />,
  <Route 
    key="staff-requests"
    path="/staff/requests" 
    element={
      <ProtectedRoute requiredRoles={["admin", "nazer", "accountant"]}>
        <StaffRequestsManagement />
      </ProtectedRoute>
    } 
  />,
  <Route 
    key="emergency-aid"
    path="/emergency-aid" 
    element={
      <ProtectedRoute requiredRoles={["admin", "nazer", "accountant"]}>
        <EmergencyAidManagement />
      </ProtectedRoute>
    } 
  />,
  
  // الدعم والمساعدة
  <Route key="support" path="/support" element={<Support />} />,
  <Route key="knowledge-base" path="/knowledge-base" element={<KnowledgeBase />} />,
  <Route 
    key="messages"
    path="/messages" 
    element={
      <ProtectedRoute>
        <Messages />
      </ProtectedRoute>
    } 
  />,
  <Route key="chatbot" path="/chatbot" element={<Chatbot />} />,
  
  // الحوكمة
  <Route 
    key="governance-decisions"
    path="/governance/decisions" 
    element={
      <ProtectedRoute requiredRoles={["admin", "nazer", "beneficiary", "waqf_heir"]}>
        <GovernanceDecisions />
      </ProtectedRoute>
    } 
  />,
  <Route 
    key="decision-details"
    path="/governance/decisions/:id" 
    element={
      <ProtectedRoute requiredRoles={["admin", "nazer", "beneficiary", "waqf_heir"]}>
        <DecisionDetails />
      </ProtectedRoute>
    } 
  />,
  
  // الإعدادات
  <Route 
    key="settings"
    path="/settings" 
    element={
      <ProtectedRoute requiredRoles={["admin", "nazer"]}>
        <Settings />
      </ProtectedRoute>
    } 
  />,
  <Route 
    key="transparency-settings"
    path="/transparency-settings" 
    element={
      <ProtectedRoute requiredRole="nazer">
        <TransparencySettings />
      </ProtectedRoute>
    } 
  />,
  <Route 
    key="notifications-settings"
    path="/notifications/settings" 
    element={
      <ProtectedRoute requiredRoles={["admin", "nazer", "accountant", "cashier", "beneficiary", "waqf_heir"]}>
        <NotificationSettingsPage />
      </ProtectedRoute>
    } 
  />,
  
  // الإشعارات
  <Route key="notifications" path="/notifications" element={<Notifications />} />,
  
  // صفحة غير موجودة
  <Route key="not-found" path="*" element={<NotFound />} />,
];
