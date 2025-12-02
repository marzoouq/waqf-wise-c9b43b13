/**
 * مسارات المستفيدين
 * Beneficiary routes - require beneficiary role
 */

import { Route } from "react-router-dom";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import {
  BeneficiaryDashboard,
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
      <ProtectedRoute requiredRole="beneficiary">
        <BeneficiaryDashboard />
      </ProtectedRoute>
    } 
  />,
  <Route 
    key="beneficiary-support"
    path="/beneficiary-support" 
    element={
      <ProtectedRoute requiredRole="beneficiary">
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
      <ProtectedRoute requiredRole="beneficiary">
        <BeneficiaryRequests />
      </ProtectedRoute>
    } 
  />,
  <Route 
    key="beneficiary-account-statement"
    path="/beneficiary/account-statement" 
    element={
      <ProtectedRoute requiredRole="beneficiary">
        <BeneficiaryAccountStatement />
      </ProtectedRoute>
    } 
  />,
  <Route 
    key="beneficiary-reports"
    path="/beneficiary/reports" 
    element={
      <ProtectedRoute requiredRole="beneficiary">
        <BeneficiaryReports />
      </ProtectedRoute>
    } 
  />,
  <Route
    key="beneficiary-portal"
    path="/beneficiary-portal"
    element={
      <ProtectedRoute requiredRole="beneficiary">
        <BeneficiaryPortal />
      </ProtectedRoute>
    } 
  />,
  <Route
    key="beneficiary-settings"
    path="/beneficiary-settings"
    element={
      <ProtectedRoute requiredRole="beneficiary">
        <BeneficiarySettings />
      </ProtectedRoute>
    } 
  />,
];
