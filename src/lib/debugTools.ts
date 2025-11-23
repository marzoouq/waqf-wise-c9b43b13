/**
 * أدوات تصحيح أخطاء متقدمة للمطورين
 * Developer Debug Tools
 */

// Error logs moved to unified system
import { selfHealing } from './selfHealing';

interface DebugTools {
  viewErrors: () => any[];
  clearErrors: () => void;
  exportErrors: () => string;
  clearCache: () => void;
  reconnectDB: () => Promise<boolean>;
  syncPending: () => Promise<void>;
  healthStatus: () => Promise<any>;
}

/**
 * عرض الأخطاء المسجلة (معطلة حالياً)
 */
function viewErrors() {
  console.log('⚠️ Error logs moved to unified system');
  return [];
}

/**
 * مسح سجل الأخطاء (معطلة حالياً)
 */
function clearErrors() {
  console.log('⚠️ Error logs moved to unified system');
}

/**
 * تصدير الأخطاء (معطلة حالياً)
 */
function exportErrors() {
  console.log('⚠️ Error logs moved to unified system');
  return '[]';
}

/**
 * مسح الذاكرة المؤقتة
 */
function clearCacheDebug() {
  selfHealing.cache.clear();
  console.log('🗑️ تم مسح الذاكرة المؤقتة');
}

/**
 * إعادة الاتصال بقاعدة البيانات
 */
async function reconnectDB() {
  console.log('🔄 جاري إعادة الاتصال بقاعدة البيانات...');
  const success = await selfHealing.autoRecovery.reconnectDatabase();
  if (success) {
    console.log('✅ تم إعادة الاتصال بنجاح');
  } else {
    console.error('❌ فشل إعادة الاتصال');
  }
  return success;
}

/**
 * مزامنة البيانات المعلقة
 */
async function syncPending() {
  console.log('🔄 جاري مزامنة البيانات المعلقة...');
  await selfHealing.autoRecovery.syncPendingData();
  console.log('✅ تمت المزامنة بنجاح');
}

/**
 * عرض حالة صحة النظام
 */
async function healthStatus() {
  console.log('🏥 جاري فحص صحة النظام...');
  
  // فحص قاعدة البيانات
  const dbHealth = await selfHealing.autoRecovery.reconnectDatabase();
  
  // فحص التخزين المحلي
  let storageHealth = true;
  try {
    localStorage.setItem('health_test', 'ok');
    localStorage.removeItem('health_test');
  } catch {
    storageHealth = false;
  }
  
  // فحص الشبكة
  const networkHealth = navigator.onLine;
  
  const status = {
    database: dbHealth ? '✅ سليمة' : '❌ فشلت',
    storage: storageHealth ? '✅ سليمة' : '❌ فشلت',
    network: networkHealth ? '✅ متصل' : '❌ غير متصل',
    overall: (dbHealth && storageHealth && networkHealth) ? '✅ النظام سليم' : '⚠️ يوجد مشاكل'
  };
  
  console.table(status);
  return status;
}

/**
 * تهيئة أدوات التصحيح العامة
 */
export function initDebugTools() {
  // إنشاء كائن عام للأدوات
  const debugTools: DebugTools = {
    viewErrors,
    clearErrors,
    exportErrors,
    clearCache: clearCacheDebug,
    reconnectDB,
    syncPending,
    healthStatus
  };

  // إتاحته عالمياً
  if (typeof window !== 'undefined') {
    (window as Window & { waqfDebug?: DebugTools }).waqfDebug = debugTools;
  }

  // تسجيل رسالة في Console
  if (import.meta.env.DEV) {
    console.log(
      '%c💻 أدوات التصحيح متاحة!',
      'background: #0ea5e9; color: white; padding: 8px 12px; border-radius: 4px; font-size: 14px; font-weight: bold;'
    );
    console.log(
      '%cاستخدم window.waqfDebug للوصول لجميع الأدوات',
      'color: #0ea5e9; font-size: 12px;'
    );
    console.log('الأدوات المتاحة:', Object.keys(debugTools));
  }
}
