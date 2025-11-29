/**
 * مسارات الإدارة والنظام
 * Admin and system routes
 */

import { Route } from "react-router-dom";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import {
  Users,
  RolesManagement,
  PermissionsManagement,
  AuditLogs,
  SystemMonitoring,
  SystemErrorLogs,
  SystemMaintenance,
  SystemTesting,
  SecurityDashboard,
  PerformanceDashboard,
  IntegrationsManagement,
  DeveloperGuide,
  DeveloperTools,
  ProjectDocumentation,
  AIInsights,
  AdvancedSettings,
  LandingPageSettings,
  SupportManagement,
} from "./lazyPages";

export const adminRoutes = [
  <Route 
    key="users"
    path="/users" 
    element={
      <ProtectedRoute requiredRoles={["admin", "nazer"]}>
        <Users />
      </ProtectedRoute>
    } 
  />,
  <Route 
    key="settings-roles"
    path="/settings/roles"
    element={
      <ProtectedRoute requiredRoles={["admin", "nazer"]}>
        <RolesManagement />
      </ProtectedRoute>
    } 
  />,
  <Route 
    key="settings-permissions"
    path="/settings/permissions" 
    element={
      <ProtectedRoute requiredRoles={["admin", "nazer"]}>
        <PermissionsManagement />
      </ProtectedRoute>
    } 
  />,
  <Route 
    key="audit-logs"
    path="/audit-logs" 
    element={
      <ProtectedRoute requiredRoles={["admin", "nazer"]}>
        <AuditLogs />
      </ProtectedRoute>
    } 
  />,
  <Route 
    key="system-monitoring"
    path="/system-monitoring" 
    element={
      <ProtectedRoute requiredRoles={["admin", "nazer"]}>
        <SystemMonitoring />
      </ProtectedRoute>
    } 
  />,
  <Route 
    key="system-error-logs"
    path="/system-error-logs" 
    element={
      <ProtectedRoute requiredRoles={["admin", "nazer"]}>
        <SystemErrorLogs />
      </ProtectedRoute>
    } 
  />,
  <Route
    key="system-maintenance"
    path="/system-maintenance" 
    element={
      <ProtectedRoute requiredRole="admin">
        <SystemMaintenance />
      </ProtectedRoute>
    } 
  />,
  <Route 
    key="system-testing"
    path="/system-testing" 
    element={
      <ProtectedRoute requiredRole="admin">
        <SystemTesting />
      </ProtectedRoute>
    } 
  />,
  <Route 
    key="security"
    path="/security" 
    element={
      <ProtectedRoute requiredRoles={["admin", "nazer"]}>
        <SecurityDashboard />
      </ProtectedRoute>
    } 
  />,
  <Route 
    key="performance"
    path="/performance" 
    element={
      <ProtectedRoute requiredRoles={["admin", "nazer"]}>
        <PerformanceDashboard />
      </ProtectedRoute>
    } 
  />,
  <Route 
    key="integrations"
    path="/integrations" 
    element={
      <ProtectedRoute requiredRoles={["admin", "nazer"]}>
        <IntegrationsManagement />
      </ProtectedRoute>
    } 
  />,
  <Route 
    key="ai-insights"
    path="/ai-insights" 
    element={
      <ProtectedRoute requiredRoles={["admin", "nazer"]}>
        <AIInsights />
      </ProtectedRoute>
    } 
  />,
  <Route
    key="advanced-settings"
    path="/advanced-settings" 
    element={
      <ProtectedRoute requiredRole="admin">
        <AdvancedSettings />
      </ProtectedRoute>
    } 
  />,
  <Route 
    key="settings-landing-page"
    path="/settings/landing-page" 
    element={
      <ProtectedRoute requiredRoles={["admin", "nazer"]}>
        <LandingPageSettings />
      </ProtectedRoute>
    } 
  />,
  <Route 
    key="support-management"
    path="/support-management" 
    element={
      <ProtectedRoute requiredRoles={["admin", "nazer"]}>
        <SupportManagement />
      </ProtectedRoute>
    } 
  />,
  <Route 
    key="developer-guide"
    path="/developer-guide" 
    element={
      <ProtectedRoute requiredRole="admin">
        <DeveloperGuide />
      </ProtectedRoute>
    } 
  />,
  <Route 
    key="developer-tools"
    path="/developer-tools" 
    element={
      <ProtectedRoute requiredRole="admin">
        <DeveloperTools />
      </ProtectedRoute>
    } 
  />,
  <Route 
    key="project-documentation"
    path="/project-documentation" 
    element={
      <ProtectedRoute requiredRoles={["admin", "nazer"]}>
        <ProjectDocumentation />
      </ProtectedRoute>
    } 
  />,
];
