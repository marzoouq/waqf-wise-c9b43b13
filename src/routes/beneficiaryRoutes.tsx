/**
 * مسارات المستفيدين
 * Beneficiary routes - require beneficiary role
 */

import { Route } from "react-router-dom";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import {
  BeneficiarySupport,
  BeneficiaryRequests,
  BeneficiaryAccountStatement,
  BeneficiaryReports,
  BeneficiaryPortal,
  BeneficiarySettings,
} from "./lazyPages";

/**
 * مسارات المستفيد المستقلة (خارج MainLayout)
 */
export const beneficiaryStandaloneRoutes = [
  <Route 
    key="beneficiary-dashboard"
    path="/beneficiary-dashboard" 
    element={
      <ProtectedRoute requiredRoles={["beneficiary", "waqf_heir", "nazer", "admin"]}>
        <BeneficiaryPortal />
      </ProtectedRoute>
    } 
  />,
  <Route 
    key="beneficiary-support"
    path="/beneficiary-support" 
    element={
      <ProtectedRoute requiredRoles={["beneficiary", "waqf_heir"]}>
        <BeneficiarySupport />
      </ProtectedRoute>
    } 
  />,
];

/**
 * مسارات المستفيد داخل MainLayout
 */
export const beneficiaryProtectedRoutes = [
  <Route 
    key="beneficiary-requests"
    path="/beneficiary/requests" 
    element={
      <ProtectedRoute requiredRoles={["beneficiary", "waqf_heir"]}>
        <BeneficiaryRequests />
      </ProtectedRoute>
    } 
  />,
  <Route 
    key="beneficiary-account-statement"
    path="/beneficiary/account-statement" 
    element={
      <ProtectedRoute requiredRoles={["beneficiary", "waqf_heir"]}>
        <BeneficiaryAccountStatement />
      </ProtectedRoute>
    } 
  />,
  <Route 
    key="beneficiary-reports"
    path="/beneficiary/reports" 
    element={
      <ProtectedRoute requiredRoles={["beneficiary", "waqf_heir"]}>
        <BeneficiaryReports />
      </ProtectedRoute>
    } 
  />,
  <Route
    key="beneficiary-settings"
    path="/beneficiary-settings"
    element={
      <ProtectedRoute requiredRoles={["beneficiary", "waqf_heir"]}>
        <BeneficiarySettings />
      </ProtectedRoute>
    } 
  />,
];
