/**
 * AppShell - الهيكل الرئيسي للتطبيق المحمي
 * يحتوي على جميع Providers والمكونات الثقيلة
 * يتم تحميله فقط للصفحات المحمية (lazy loaded)
 */

import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Routes, Route } from "react-router-dom";
import { Suspense } from "react";
import { SettingsProvider } from "@/contexts/SettingsContext";
import { AuthProvider } from "@/contexts/AuthContext";
import MainLayout from "./MainLayout";
import { LazyErrorBoundary } from "@/components/shared/LazyErrorBoundary";
import { LoadingState } from "@/components/shared/LoadingState";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { RoleBasedRedirect } from "@/components/auth/RoleBasedRedirect";

// Import routes
import { 
  beneficiaryStandaloneRoutes, 
  dashboardRoutes,
  adminRoutes,
  coreRoutes,
  beneficiaryProtectedRoutes,
} from "@/routes";

export default function AppShell() {
  return (
    <AuthProvider>
      <SettingsProvider>
        <TooltipProvider>
          <Sonner />
          <LazyErrorBoundary>
            <Routes>
              {/* صفحة التوجيه الذكي */}
              <Route path="/redirect" element={<RoleBasedRedirect />} />
              
              {/* مسارات المستفيد المستقلة */}
              {beneficiaryStandaloneRoutes}
              
              {/* ✅ المسارات المحمية داخل Suspense */}
              <Route
                path="/*"
                element={
                  <Suspense fallback={<LoadingState size="lg" fullScreen />}>
                    <ProtectedRoute>
                      <MainLayout>
                        <Routes>
                          {/* لوحات التحكم */}
                          {dashboardRoutes}
                          
                          {/* مسارات الإدارة */}
                          {adminRoutes}
                          
                          {/* مسارات المستفيد داخل MainLayout */}
                          {beneficiaryProtectedRoutes}
                          
                          {/* المسارات الأساسية */}
                          {coreRoutes}
                        </Routes>
                      </MainLayout>
                    </ProtectedRoute>
                  </Suspense>
                }
              />
            </Routes>
          </LazyErrorBoundary>
        </TooltipProvider>
      </SettingsProvider>
    </AuthProvider>
  );
}
