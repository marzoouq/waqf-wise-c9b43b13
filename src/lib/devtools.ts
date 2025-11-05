/**
 * Development Tools Configuration
 * Controls React Query DevTools visibility and behavior
 * Only available in development mode
 */

export const DEVTOOLS_CONFIG = {
  enabled: import.meta.env.DEV,
  position: 'bottom-right' as const,
  initialIsOpen: false,
  panelPosition: 'bottom' as const,
};

// Add console toggle for DevTools in development
if (import.meta.env.DEV) {
  (window as any).toggleQueryDevtools = () => {
    console.log('💡 React Query DevTools: انقر على الأيقونة أسفل يمين الشاشة');
    console.log('📊 يمكنك مراقبة جميع الـ queries والـ cache من خلال الأداة');
  };
  
  console.log('🛠️ Development Mode: React Query DevTools متاح');
  console.log('ℹ️ استخدم toggleQueryDevtools() في console للمزيد من المعلومات');
}
