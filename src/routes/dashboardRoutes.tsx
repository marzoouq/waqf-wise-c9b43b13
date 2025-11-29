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
