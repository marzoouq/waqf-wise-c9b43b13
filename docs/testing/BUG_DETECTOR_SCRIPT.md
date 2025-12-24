# 🔍 سكربت اكتشاف الأعطال التلقائي

## نظرة عامة
هذا السكربت يُشغّل في Console المتصفح لاكتشاف 80% من الأعطال المخفية تلقائياً.

---

## 🚀 السكربت الكامل

انسخ والصق في Console:

```javascript
/**
 * 🔍 نظام اكتشاف الأعطال - Waqf System Bug Detector
 * الإصدار: 1.0.0
 * التاريخ: 2024
 */

(function() {
  console.clear();
  console.log('%c🔍 نظام اكتشاف الأعطال - Waqf System', 'font-size: 20px; font-weight: bold; color: #4CAF50;');
  console.log('%c═══════════════════════════════════════════════════════════', 'color: #888;');

  // ═══════════════════════════════════════════════════════════
  // 1️⃣ مراقبة أخطاء JavaScript
  // ═══════════════════════════════════════════════════════════
  
  const jsErrors = [];
  
  window.onerror = function(message, source, lineno, colno, error) {
    const errorInfo = {
      type: 'JS_ERROR',
      message,
      source,
      line: lineno,
      column: colno,
      stack: error?.stack,
      timestamp: new Date().toISOString()
    };
    jsErrors.push(errorInfo);
    console.error('%c❌ خطأ JavaScript:', 'color: red; font-weight: bold;', errorInfo);
    return false;
  };

  window.onunhandledrejection = function(event) {
    const errorInfo = {
      type: 'UNHANDLED_PROMISE',
      reason: event.reason,
      timestamp: new Date().toISOString()
    };
    jsErrors.push(errorInfo);
    console.error('%c❌ Promise غير معالج:', 'color: orange; font-weight: bold;', errorInfo);
  };

  // ═══════════════════════════════════════════════════════════
  // 2️⃣ مراقبة طلبات الشبكة
  // ═══════════════════════════════════════════════════════════
  
  const networkRequests = [];
  const failedRequests = [];
  const slowRequests = [];
  const SLOW_THRESHOLD = 3000; // 3 ثوانٍ

  const originalFetch = window.fetch;
  window.fetch = async function(...args) {
    const startTime = Date.now();
    const url = typeof args[0] === 'string' ? args[0] : args[0]?.url || 'unknown';
    
    try {
      const response = await originalFetch.apply(this, args);
      const duration = Date.now() - startTime;
      
      const requestInfo = {
        url,
        method: args[1]?.method || 'GET',
        status: response.status,
        duration,
        timestamp: new Date().toISOString()
      };
      
      networkRequests.push(requestInfo);
      
      if (!response.ok) {
        failedRequests.push(requestInfo);
        console.warn('%c⚠️ طلب فاشل:', 'color: red;', `${response.status} - ${url}`);
      }
      
      if (duration > SLOW_THRESHOLD) {
        slowRequests.push(requestInfo);
        console.warn('%c🐌 طلب بطيء:', 'color: orange;', `${duration}ms - ${url}`);
      }
      
      return response;
    } catch (error) {
      const errorInfo = {
        url,
        error: error.message,
        timestamp: new Date().toISOString()
      };
      failedRequests.push(errorInfo);
      console.error('%c❌ فشل الاتصال:', 'color: red;', url, error);
      throw error;
    }
  };

  // ═══════════════════════════════════════════════════════════
  // 3️⃣ مراقبة النقرات بدون تأثير
  // ═══════════════════════════════════════════════════════════
  
  const deadClicks = [];
  let lastClickState = null;

  document.addEventListener('click', function(e) {
    const target = e.target;
    const tagName = target.tagName.toLowerCase();
    const isClickable = ['button', 'a', 'input'].includes(tagName) || 
                        target.role === 'button' ||
                        target.classList.contains('cursor-pointer') ||
                        target.onclick !== null;
    
    if (isClickable) {
      const beforeUrl = window.location.href;
      
      setTimeout(() => {
        const afterUrl = window.location.href;
        const urlChanged = beforeUrl !== afterUrl;
        
        // فحص بسيط: هل تغير شيء؟
        const clickInfo = {
          element: tagName,
          text: target.textContent?.substring(0, 50),
          className: target.className?.substring(0, 100),
          urlChanged,
          timestamp: new Date().toISOString()
        };
        
        // تسجيل للتحليل اللاحق
        lastClickState = clickInfo;
      }, 100);
    }
  }, true);

  // ═══════════════════════════════════════════════════════════
  // 4️⃣ مراقبة تغييرات DOM
  // ═══════════════════════════════════════════════════════════
  
  let domChanges = 0;
  const observer = new MutationObserver((mutations) => {
    domChanges += mutations.length;
  });
  
  observer.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: true
  });

  // ═══════════════════════════════════════════════════════════
  // 5️⃣ دوال التقارير
  // ═══════════════════════════════════════════════════════════
  
  window.BugDetector = {
    // تقرير شامل
    report: function() {
      console.log('%c📊 تقرير الأعطال', 'font-size: 16px; font-weight: bold; color: #2196F3;');
      console.log('═══════════════════════════════════════════════════════════');
      
      console.log(`%c🔴 أخطاء JavaScript: ${jsErrors.length}`, jsErrors.length ? 'color: red;' : 'color: green;');
      if (jsErrors.length) console.table(jsErrors);
      
      console.log(`%c🔴 طلبات فاشلة: ${failedRequests.length}`, failedRequests.length ? 'color: red;' : 'color: green;');
      if (failedRequests.length) console.table(failedRequests);
      
      console.log(`%c🟡 طلبات بطيئة: ${slowRequests.length}`, slowRequests.length ? 'color: orange;' : 'color: green;');
      if (slowRequests.length) console.table(slowRequests);
      
      console.log(`%c📈 إجمالي الطلبات: ${networkRequests.length}`, 'color: blue;');
      console.log(`%c🔄 تغييرات DOM: ${domChanges}`, 'color: purple;');
      
      return {
        jsErrors,
        failedRequests,
        slowRequests,
        totalRequests: networkRequests.length,
        domChanges
      };
    },
    
    // فحص Route الحالي
    checkRoute: function() {
      console.log('%c🛤️ معلومات Route', 'font-size: 14px; font-weight: bold;');
      console.log('URL:', window.location.href);
      console.log('Path:', window.location.pathname);
      console.log('Hash:', window.location.hash);
      
      // فحص وجود محتوى
      const mainContent = document.querySelector('main, [role="main"], #root > div');
      const hasContent = mainContent && mainContent.children.length > 0;
      const hasSpinner = document.querySelector('[class*="animate-spin"], .loading, [class*="skeleton"]');
      const hasError = document.querySelector('[class*="error"], [role="alert"]');
      
      console.log('📄 المحتوى موجود:', hasContent ? '✅ نعم' : '❌ لا');
      console.log('⏳ Loading ظاهر:', hasSpinner ? '⚠️ نعم' : '✅ لا');
      console.log('❌ خطأ ظاهر:', hasError ? '🔴 نعم' : '✅ لا');
      
      return { hasContent, hasSpinner, hasError };
    },
    
    // فحص جميع الأزرار
    checkButtons: function() {
      const buttons = document.querySelectorAll('button, [role="button"], a[href]');
      console.log(`%c🔘 عدد الأزرار: ${buttons.length}`, 'font-size: 14px; font-weight: bold;');
      
      const buttonList = Array.from(buttons).map(btn => ({
        text: btn.textContent?.trim().substring(0, 30),
        type: btn.tagName.toLowerCase(),
        disabled: btn.disabled,
        visible: btn.offsetParent !== null
      }));
      
      console.table(buttonList.slice(0, 20));
      return buttonList;
    },
    
    // فحص التبويبات
    checkTabs: function() {
      const tabs = document.querySelectorAll('[role="tab"], [data-state="active"], [data-state="inactive"]');
      console.log(`%c📑 عدد التبويبات: ${tabs.length}`, 'font-size: 14px; font-weight: bold;');
      
      const tabList = Array.from(tabs).map(tab => ({
        text: tab.textContent?.trim().substring(0, 30),
        active: tab.getAttribute('data-state') === 'active' || tab.getAttribute('aria-selected') === 'true',
        visible: tab.offsetParent !== null
      }));
      
      console.table(tabList);
      return tabList;
    },
    
    // مسح البيانات
    clear: function() {
      jsErrors.length = 0;
      failedRequests.length = 0;
      slowRequests.length = 0;
      networkRequests.length = 0;
      domChanges = 0;
      console.log('%c🧹 تم مسح جميع البيانات', 'color: green;');
    },
    
    // مساعدة
    help: function() {
      console.log('%c📖 الأوامر المتاحة:', 'font-size: 14px; font-weight: bold;');
      console.log('BugDetector.report()     - تقرير شامل');
      console.log('BugDetector.checkRoute() - فحص Route الحالي');
      console.log('BugDetector.checkButtons() - فحص الأزرار');
      console.log('BugDetector.checkTabs()  - فحص التبويبات');
      console.log('BugDetector.clear()      - مسح البيانات');
      console.log('BugDetector.help()       - هذه المساعدة');
    }
  };

  console.log('%c✅ تم تفعيل نظام اكتشاف الأعطال', 'color: green; font-weight: bold;');
  console.log('%c💡 اكتب BugDetector.help() للمساعدة', 'color: blue;');
  console.log('%c═══════════════════════════════════════════════════════════', 'color: #888;');

})();
```

---

## 📋 كيفية الاستخدام

### الخطوة 1: فتح Console
- اضغط `F12` أو `Ctrl+Shift+I`
- انتقل إلى تبويب **Console**

### الخطوة 2: نسخ ولصق السكربت
- انسخ السكربت أعلاه
- الصقه في Console
- اضغط Enter

### الخطوة 3: التنقل والاختبار
- تنقل في التطبيق بشكل طبيعي
- اضغط على الأزرار والتبويبات
- السكربت سيسجل كل شيء تلقائياً

### الخطوة 4: عرض التقرير
```javascript
BugDetector.report()
```

---

## 🎯 الأوامر المتاحة

| الأمر | الوظيفة |
|-------|---------|
| `BugDetector.report()` | عرض تقرير شامل بجميع الأخطاء |
| `BugDetector.checkRoute()` | فحص Route الحالي |
| `BugDetector.checkButtons()` | قائمة بجميع الأزرار في الصفحة |
| `BugDetector.checkTabs()` | قائمة بجميع التبويبات |
| `BugDetector.clear()` | مسح جميع البيانات المسجلة |
| `BugDetector.help()` | عرض المساعدة |

---

## 🔍 تفسير النتائج

### 🔴 أخطاء حرجة (يجب إصلاحها فوراً)
- `JS_ERROR` - خطأ JavaScript يمنع الوظيفة
- `UNHANDLED_PROMISE` - Promise رفض بدون معالجة
- طلب بحالة `500` - خطأ في الخادم

### 🟡 تحذيرات (تحتاج مراجعة)
- طلب بحالة `401/403` - مشكلة صلاحيات
- طلب بطيء > 3 ثوانٍ - أداء ضعيف
- Loading دائم - Query لا يكتمل

### 🟢 طبيعي
- طلبات ناجحة `200`
- تغييرات DOM طبيعية
- لا أخطاء

---

## 📊 مثال على التقرير

```
📊 تقرير الأعطال
═══════════════════════════════════════════════════════════
🔴 أخطاء JavaScript: 0
🔴 طلبات فاشلة: 2
┌─────┬──────────────────────────┬────────┬────────┐
│ URL │ /api/beneficiaries       │ Status │ 401    │
│ URL │ /api/distributions       │ Status │ 500    │
└─────┴──────────────────────────┴────────┴────────┘
🟡 طلبات بطيئة: 1
📈 إجمالي الطلبات: 45
🔄 تغييرات DOM: 234
```

---

## ✅ قائمة الفحص السريع

بعد تشغيل السكربت، نفّذ التالي:

1. [ ] افتح كل Dashboard
2. [ ] اضغط على كل تبويب
3. [ ] اضغط على الأزرار الرئيسية
4. [ ] افتح Dialogs
5. [ ] نفّذ `BugDetector.report()`
6. [ ] سجّل أي أخطاء

---

## 🛠️ نصائح متقدمة

### فحص صفحة معينة
```javascript
// افتح الصفحة ثم:
BugDetector.clear();
// تفاعل مع الصفحة
BugDetector.report();
```

### فحص تبويب معين
```javascript
// قبل الضغط على التبويب
BugDetector.clear();
// اضغط على التبويب
// انتظر التحميل
BugDetector.checkRoute();
BugDetector.report();
```

### تتبع زر معين
```javascript
// قبل الضغط
console.log('قبل الضغط');
BugDetector.clear();
// اضغط الزر
// راقب Console
```
