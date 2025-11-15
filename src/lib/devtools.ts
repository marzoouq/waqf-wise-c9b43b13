/**
 * TanStack React Query DevTools Configuration
 * أدوات المطور لمراقبة وتتبع جميع الـ queries والـ mutations والـ cache
 * متاح في بيئة التطوير فقط
 */

export const DEVTOOLS_CONFIG = {
  // تفعيل الأدوات في بيئة التطوير
  enabled: import.meta.env.DEV,
  
  // فتح اللوحة تلقائياً عند التحميل
  initialIsOpen: false,
  
  // موضع اللوحة (top, bottom, left, right)
  position: 'bottom-right' as const,
};

// إضافة أدوات تحكم في console للمطورين
if (import.meta.env.DEV) {
  // دالة لفتح/إغلاق DevTools
  (window as any).toggleQueryDevtools = () => {
    console.log('💡 React Query DevTools مفعّل');
    console.log('📊 يمكنك مراقبة:');
    console.log('  • جميع الـ Queries (استعلامات البيانات)');
    console.log('  • جميع الـ Mutations (عمليات التعديل)');
    console.log('  • الـ Cache (ذاكرة التخزين المؤقت)');
    console.log('  • حالة التحميل والأخطاء');
    console.log('  • تفاصيل الشبكة والأداء');
    console.log('🔍 استخدم الأيقونة أسفل يسار الشاشة');
  };
  
  // دالة لعرض معلومات QueryClient
  (window as any).getQueryClientInfo = () => {
    console.log('📊 معلومات QueryClient:');
    console.log('  • staleTime: 5 دقائق');
    console.log('  • gcTime: 10 دقائق');
    console.log('  • retry: 3 محاولات');
    console.log('  • refetchOnWindowFocus: معطّل');
    console.log('  • refetchOnReconnect: مفعّل');
  };
  
  // دالة لعرض جميع الـ queries النشطة
  (window as any).showActiveQueries = () => {
    console.log('🔄 للاطلاع على الـ queries النشطة، افتح React Query DevTools');
  };
  
  // رسالة الترحيب
  console.log('');
  console.log('╔══════════════════════════════════════════════╗');
  console.log('║  🛠️  TanStack React Query DevTools v5       ║');
  console.log('╚══════════════════════════════════════════════╝');
  console.log('');
  console.log('✅ أدوات المطور مفعّلة على كامل التطبيق');
  console.log('');
  console.log('📌 الأوامر المتاحة:');
  console.log('  • toggleQueryDevtools() - معلومات الأدوات');
  console.log('  • getQueryClientInfo() - إعدادات QueryClient');
  console.log('  • showActiveQueries() - الاستعلامات النشطة');
  console.log('');
  console.log('🎯 الأدوات تراقب:');
  console.log('  ✓ جميع الصفحات والمسارات');
  console.log('  ✓ كافة الـ Hooks والمكونات');
  console.log('  ✓ جميع الطلبات والاستجابات');
  console.log('  ✓ حالة الـ Cache والتحديثات');
  console.log('  ✓ الأخطاء والتحذيرات');
  console.log('');
}
