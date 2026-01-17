/**
 * UX Provider - مزود سياق UX الموحد
 * يوفر الوصول لجميع أنظمة UX عبر التطبيق
 * 
 * @version 1.0.0
 */

import React, { createContext, useContext, useEffect, useMemo } from 'react';
import { useUXIntegration, type UseUXIntegrationReturn } from '@/hooks/ui/useUXIntegration';
import { SkipLinks, MainContent } from '@/components/shared/SkipLinks';
import { KeyboardShortcutsHelp } from '@/components/shared/KeyboardShortcutsHelp';
import { useKeyboardShortcuts } from '@/hooks/ui/useKeyboardShortcuts';

// ==================== Context ====================

const UXContext = createContext<UseUXIntegrationReturn | null>(null);

/**
 * استخدام سياق UX
 */
export function useUX(): UseUXIntegrationReturn {
  const context = useContext(UXContext);
  if (!context) {
    throw new Error('useUX must be used within a UXProvider');
  }
  return context;
}

// ==================== Provider Props ====================

export interface UXProviderProps {
  children: React.ReactNode;
  
  // Features toggles
  enableSkipLinks?: boolean;
  enableKeyboardShortcuts?: boolean;
  enablePerformanceMonitoring?: boolean;
  
  // Callbacks
  onError?: (error: Error) => void;
  onPerformanceIssue?: (issue: string) => void;
}

// ==================== Provider Component ====================

export function UXProvider({
  children,
  enableSkipLinks = true,
  enableKeyboardShortcuts = true,
  enablePerformanceMonitoring = false,
  onError,
  onPerformanceIssue,
}: UXProviderProps) {
  const uxIntegration = useUXIntegration();
  const [showShortcutsHelp, setShowShortcutsHelp] = React.useState(false);
  
  // Keyboard shortcuts
  useKeyboardShortcuts(
    enableKeyboardShortcuts
      ? [
          {
            key: '?',
            shift: true,
            description: 'عرض اختصارات لوحة المفاتيح',
            action: () => setShowShortcutsHelp(true),
          },
        ]
      : []
  );
  
  // Performance monitoring
  useEffect(() => {
    if (!enablePerformanceMonitoring) return;
    
    const checkPerformance = () => {
      const { metrics } = uxIntegration;
      
      if (metrics.largestContentfulPaint && metrics.largestContentfulPaint > 2500) {
        onPerformanceIssue?.('LCP is above 2.5s threshold');
      }
      
      if (metrics.timeToInteractive && metrics.timeToInteractive > 3000) {
        onPerformanceIssue?.('TTI is above 3s threshold');
      }
    };
    
    // Check after initial load
    const timer = setTimeout(checkPerformance, 5000);
    return () => clearTimeout(timer);
  }, [enablePerformanceMonitoring, uxIntegration, onPerformanceIssue]);
  
  // Error boundary integration
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      onError?.(new Error(event.message));
    };
    
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      onError?.(new Error(String(event.reason)));
    };
    
    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    
    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, [onError]);
  
  // Apply body classes based on capabilities
  useEffect(() => {
    const { capabilities, isOnline } = uxIntegration;
    const body = document.body;
    
    // Device type
    body.classList.toggle('touch-device', capabilities.hasTouchScreen);
    body.classList.toggle('pointer-device', capabilities.hasPointer);
    
    // Preferences
    body.classList.toggle('reduced-motion', capabilities.prefersReducedMotion);
    body.classList.toggle('high-contrast', capabilities.prefersHighContrast);
    
    // Network
    body.classList.toggle('offline', !isOnline);
    
    return () => {
      body.classList.remove(
        'touch-device',
        'pointer-device',
        'reduced-motion',
        'high-contrast',
        'offline'
      );
    };
  }, [uxIntegration]);
  
  const contextValue = useMemo(() => uxIntegration, [uxIntegration]);
  
  return (
    <UXContext.Provider value={contextValue}>
      {enableSkipLinks && <SkipLinks />}
      
      <MainContent>
        {children}
      </MainContent>
      
      {enableKeyboardShortcuts && (
        <KeyboardShortcutsHelp
          open={showShortcutsHelp}
          onOpenChange={setShowShortcutsHelp}
        />
      )}
    </UXContext.Provider>
  );
}

// ==================== Higher Order Component ====================

/**
 * HOC لإضافة قدرات UX لمكون
 */
export function withUX<P extends object>(
  Component: React.ComponentType<P & { ux: UseUXIntegrationReturn }>
) {
  const WrappedComponent = (props: P) => {
    const ux = useUX();
    return <Component {...props} ux={ux} />;
  };
  
  WrappedComponent.displayName = `withUX(${Component.displayName || Component.name || 'Component'})`;
  
  return WrappedComponent;
}

// ==================== Utility Components ====================

/**
 * مكون يظهر فقط للأجهزة اللمسية
 */
export function TouchOnly({ children }: { children: React.ReactNode }) {
  const { isTouch } = useUX();
  if (!isTouch) return null;
  return <>{children}</>;
}

/**
 * مكون يظهر فقط للأجهزة غير اللمسية
 */
export function PointerOnly({ children }: { children: React.ReactNode }) {
  const { isTouch } = useUX();
  if (isTouch) return null;
  return <>{children}</>;
}

/**
 * مكون يظهر فقط عند الاتصال بالإنترنت
 */
export function OnlineOnly({ children }: { children: React.ReactNode }) {
  const { isOnline } = useUX();
  if (!isOnline) return null;
  return <>{children}</>;
}

/**
 * مكون يظهر فقط عند عدم الاتصال
 */
export function OfflineOnly({ children }: { children: React.ReactNode }) {
  const { isOnline } = useUX();
  if (isOnline) return null;
  return <>{children}</>;
}

/**
 * مكون يخفي الحركة إذا كان المستخدم يفضل ذلك
 */
export function MotionSafe({ 
  children, 
  fallback 
}: { 
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  const { prefersReducedMotion } = useUX();
  if (prefersReducedMotion) return <>{fallback || null}</>;
  return <>{children}</>;
}

export default UXProvider;
