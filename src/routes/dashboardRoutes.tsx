/**
 * مسارات لوحات التحكم
 * Dashboard routes - role-specific dashboards
 */

import { Route, Navigate } from "react-router-dom";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import {
  Dashboard,
  NazerDashboard,
  AccountantDashboard,
  CashierDashboard,
  ArchivistDashboard,
  AdminDashboard,
} from "./lazyPages";

export const dashboardRoutes = [
  <Route key="index" index element={<Navigate to="/dashboard" replace />} />,
  <Route key="dashboard" path="/dashboard" element={<Dashboard />} />,
  
  // إعادة توجيه المسارات القديمة/الخاطئة
  <Route key="redirect-archivist" path="/dashboard/archivist" element={<Navigate to="/archivist-dashboard" replace />} />,
  <Route key="redirect-accountant" path="/dashboard/accountant" element={<Navigate to="/accountant-dashboard" replace />} />,
  <Route key="redirect-cashier" path="/dashboard/cashier" element={<Navigate to="/cashier-dashboard" replace />} />,
  <Route key="redirect-nazer" path="/dashboard/nazer" element={<Navigate to="/nazer-dashboard" replace />} />,
  <Route key="redirect-admin" path="/dashboard/admin" element={<Navigate to="/admin-dashboard" replace />} />,
  <Route
    key="nazer-dashboard"
    path="/nazer-dashboard" 
    element={
      <ProtectedRoute requiredRole="nazer">
        <NazerDashboard />
      </ProtectedRoute>
    } 
  />,
  <Route 
    key="accountant-dashboard"
    path="/accountant-dashboard" 
    element={
      <ProtectedRoute requiredRole="accountant">
        <AccountantDashboard />
      </ProtectedRoute>
    } 
  />,
  <Route 
    key="cashier-dashboard"
    path="/cashier-dashboard" 
    element={
      <ProtectedRoute requiredRole="cashier">
        <CashierDashboard />
      </ProtectedRoute>
    } 
  />,
  <Route 
    key="archivist-dashboard"
    path="/archivist-dashboard" 
    element={
      <ProtectedRoute requiredRole="archivist">
        <ArchivistDashboard />
      </ProtectedRoute>
    } 
  />,
  <Route 
    key="admin-dashboard"
    path="/admin-dashboard" 
    element={
      <ProtectedRoute requiredRole="admin">
        <AdminDashboard />
      </ProtectedRoute>
    } 
  />,
];
