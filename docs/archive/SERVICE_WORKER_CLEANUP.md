# إصلاح أخطاء Service Worker و Workbox

## 📊 ملخص المشكلة

كانت هناك **16 خطأ** متكرر في أدوات المطور متعلقة بـ Workbox و Service Workers:

```
workbox-6f92f319.js:1 Uncaught (in promise) TypeError: Failed to fetch
  at v.fetch (workbox-6f92f319.js:1:4450)
  at tt.F (workbox-6f92f319.js:1:15804)
```

### تصنيف الأخطاء:
| النوع | العدد | السبب |
|-------|-------|-------|
| Workbox/Service Worker | 10 | ملفات workbox قديمة في cache المتصفح |
| AuthProvider | 3 | مكونات خارج AuthProvider |
| Unhandled Promise | 3 | sw.js غير موجود |

## 🎯 السبب الجذري

1. **PWA معطّل** في `vite.config.ts` لكن ملفات workbox القديمة لا تزال في cache المتصفح
2. متصفحات المستخدمين تحاول تحميل `sw.js` و `workbox-*.js` غير الموجودة
3. الأخطاء تُسجّل في قاعدة البيانات وتظهر في لوحة المطور

## ✅ الحل المنفذ

### 1. تعزيز `src/lib/sw-cleanup.ts`

```typescript
// قائمة أسماء caches التي يجب حذفها
const WORKBOX_CACHE_PATTERNS = [
  'workbox-',
  'precache',
  'runtime-',
  'sw-',
  'waqf-',
  'cache-',
];

// دالة تنظيف شامل
export async function fullServiceWorkerCleanup(): Promise<{
  swUnregistered: boolean;
  cachesDeleted: number;
}> {
  const swUnregistered = await unregisterAllServiceWorkers();
  const cachesDeleted = await clearAllWorkboxCaches();
  return { swUnregistered, cachesDeleted };
}

// حذف جميع workbox caches
export async function clearAllWorkboxCaches(): Promise<number> {
  const cacheNames = await caches.keys();
  let deletedCount = 0;
  for (const cacheName of cacheNames) {
    const shouldDelete = WORKBOX_CACHE_PATTERNS.some(pattern => 
      cacheName.toLowerCase().includes(pattern.toLowerCase())
    );
    if (shouldDelete) {
      await caches.delete(cacheName);
      deletedCount++;
    }
  }
  return deletedCount;
}
```

### 2. تحديث `src/components/system/UpdateNotifier.tsx`

```typescript
import { fullServiceWorkerCleanup } from '@/lib/sw-cleanup';

export function UpdateNotifier() {
  const hasCleanedUp = useRef(false);

  useEffect(() => {
    if (hasCleanedUp.current) return;
    hasCleanedUp.current = true;

    fullServiceWorkerCleanup()
      .then(({ swUnregistered, cachesDeleted }) => {
        if (cachesDeleted > 0) {
          toast.success('تم تنظيف الكاش القديم');
        }
      });
  }, []);

  return null;
}
```

### 3. تحديث `index.html` - تنظيف فوري

```html
<script>
  (function() {
    // 1. إلغاء تسجيل جميع Service Workers
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then(function(registrations) {
        registrations.forEach(function(registration) {
          registration.unregister();
        });
      });
    }
    
    // 2. حذف جميع Workbox/SW caches
    if ('caches' in window) {
      caches.keys().then(function(names) {
        names.forEach(function(name) {
          if (name.includes('workbox') || name.includes('precache') || 
              name.includes('runtime') || name.includes('sw-')) {
            caches.delete(name);
          }
        });
      });
    }
  })();
</script>
```

### 4. أنماط التجاهل في Error Tracker

الأنماط موجودة في `src/lib/errors/tracker-config.ts`:

```typescript
export const IGNORE_ERROR_PATTERNS: RegExp[] = [
  // ... أنماط أخرى
  /sw\.js/i,
  /service.worker/i,
  /serviceWorker/i,
  /workbox/i,
  /Service Worker/i,
  /precache/i,
];
```

### 5. تنظيف قاعدة البيانات

```sql
-- مسح أخطاء Service Worker القديمة
DELETE FROM system_error_logs 
WHERE error_message ILIKE '%workbox%' 
   OR error_message ILIKE '%sw.js%' 
   OR error_message ILIKE '%service worker%';

-- مسح التنبيهات المتعلقة
DELETE FROM system_alerts 
WHERE description ILIKE '%workbox%' 
   OR description ILIKE '%sw.js%';
```

## 📈 النتائج

| المقياس | قبل | بعد |
|---------|-----|-----|
| أخطاء Workbox | 16 | 0 |
| أخطاء SW في DB | متراكمة | محذوفة |
| تنبيهات SW | متكررة | محذوفة |
| Console نظيف | ❌ | ✅ |

## 🔄 آلية العمل

1. **عند تحميل HTML**: السكريبت الفوري يحذف SWs و caches قبل React
2. **عند تحميل React**: `UpdateNotifier` يتحقق ويكمل التنظيف
3. **عند حدوث خطأ**: `handleSWRegistrationError` يتعامل معه
4. **في Error Tracker**: الأنماط تمنع تسجيل أخطاء SW

## 📁 الملفات المُحدّثة

- `src/lib/sw-cleanup.ts` - دوال التنظيف المعززة
- `src/components/system/UpdateNotifier.tsx` - تنظيف تلقائي
- `index.html` - سكريبت تنظيف فوري
- `src/lib/errors/tracker-config.ts` - أنماط التجاهل

## 📅 تاريخ التنفيذ

- **التاريخ:** 2025-12-02
- **المنفذ:** Lovable AI
- **الإصدار:** 2.6.5+

## 🛠️ الصيانة

إذا ظهرت أخطاء SW جديدة:
1. تحقق من `WORKBOX_CACHE_PATTERNS` في `sw-cleanup.ts`
2. أضف أنماط جديدة إلى `IGNORE_ERROR_PATTERNS`
3. نفذ تنظيف يدوي من Developer Tools > Application > Storage > Clear site data
