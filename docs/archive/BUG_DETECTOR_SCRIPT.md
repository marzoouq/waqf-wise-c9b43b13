# سكريبت اكتشاف الأعطال - منصة الوقف

## 🎯 الهدف

سكريبت يعمل في Console المتصفح لاكتشاف الأعطال المخفية تلقائياً.

---

## 🚀 السكريبت الرئيسي

انسخ والصق هذا السكريبت في Console المتصفح (F12):

```javascript
/**
 * Bug Detector Script - Waqf Platform
 * يكتشف الأعطال المخفية في التطبيق
 */
(function() {
  const BugDetector = {
    errors: [],
    warnings: [],
    silentClicks: [],
    failedRequests: [],
    
    // تسجيل الأخطاء
    init() {
      console.log('🔍 Bug Detector Started...');
      
      // التقاط أخطاء JavaScript
      window.onerror = (msg, url, line, col, error) => {
        this.errors.push({
          type: 'js_error',
          message: msg,
          url,
          line,
          col,
          stack: error?.stack,
          time: new Date().toISOString()
        });
        console.error('🐛 JS Error:', msg);
        return false;
      };
      
      // التقاط Promise rejections
      window.onunhandledrejection = (event) => {
        this.errors.push({
          type: 'promise_rejection',
          message: event.reason?.message || event.reason,
          stack: event.reason?.stack,
          time: new Date().toISOString()
        });
        console.error('🐛 Unhandled Promise:', event.reason);
      };
      
      // مراقبة Network requests
      this.monitorNetwork();
      
      // مراقبة الـ Clicks
      this.monitorClicks();
      
      console.log('✅ Bug Detector Active');
    },
    
    // مراقبة طلبات الشبكة
    monitorNetwork() {
      const originalFetch = window.fetch;
      window.fetch = async (...args) => {
        const start = performance.now();
        try {
          const response = await originalFetch(...args);
          const duration = performance.now() - start;
          
          if (!response.ok) {
            this.failedRequests.push({
              url: args[0],
              status: response.status,
              statusText: response.statusText,
              duration,
              time: new Date().toISOString()
            });
            console.warn(`🌐 Failed Request [${response.status}]:`, args[0]);
          }
          
          if (duration > 5000) {
            this.warnings.push({
              type: 'slow_request',
              url: args[0],
              duration,
              time: new Date().toISOString()
            });
            console.warn(`🐢 Slow Request (${(duration/1000).toFixed(1)}s):`, args[0]);
          }
          
          return response;
        } catch (error) {
          this.failedRequests.push({
            url: args[0],
            error: error.message,
            time: new Date().toISOString()
          });
          console.error('🌐 Network Error:', error.message);
          throw error;
        }
      };
    },
    
    // مراقبة النقرات بدون أثر
    monitorClicks() {
      let clickStart = null;
      let initialState = null;
      
      document.addEventListener('click', (e) => {
        const target = e.target;
        const isButton = target.tagName === 'BUTTON' || 
                        target.closest('button') ||
                        target.role === 'button';
        const isTab = target.role === 'tab' || target.closest('[role="tab"]');
        
        if (isButton || isTab) {
          clickStart = performance.now();
          initialState = document.body.innerHTML.length;
          
          // فحص بعد 500ms
          setTimeout(() => {
            const currentState = document.body.innerHTML.length;
            const stateChanged = Math.abs(currentState - initialState) > 10;
            const duration = performance.now() - clickStart;
            
            if (!stateChanged && duration < 100) {
              const text = target.textContent?.trim() || 'Unknown';
              this.silentClicks.push({
                element: target.tagName,
                text: text.slice(0, 50),
                type: isTab ? 'tab' : 'button',
                time: new Date().toISOString()
              });
              console.warn(`⚠️ Silent ${isTab ? 'Tab' : 'Button'}:`, text);
            }
          }, 500);
        }
      }, true);
    },
    
    // تقرير النتائج
    report() {
      console.log('\n═══════════════════════════════════════');
      console.log('📊 BUG DETECTOR REPORT');
      console.log('═══════════════════════════════════════\n');
      
      console.log(`🔴 Errors: ${this.errors.length}`);
      this.errors.forEach((e, i) => console.log(`   ${i+1}. [${e.type}] ${e.message}`));
      
      console.log(`\n🟠 Warnings: ${this.warnings.length}`);
      this.warnings.forEach((w, i) => console.log(`   ${i+1}. [${w.type}] ${w.url || w.message}`));
      
      console.log(`\n🌐 Failed Requests: ${this.failedRequests.length}`);
      this.failedRequests.forEach((r, i) => console.log(`   ${i+1}. [${r.status || 'ERR'}] ${r.url}`));
      
      console.log(`\n⚠️ Silent Clicks: ${this.silentClicks.length}`);
      this.silentClicks.forEach((c, i) => console.log(`   ${i+1}. [${c.type}] "${c.text}"`));
      
      console.log('\n═══════════════════════════════════════');
      
      return {
        errors: this.errors,
        warnings: this.warnings,
        failedRequests: this.failedRequests,
        silentClicks: this.silentClicks,
        score: this.calculateScore()
      };
    },
    
    // حساب النتيجة
    calculateScore() {
      let score = 100;
      score -= this.errors.length * 10;
      score -= this.warnings.length * 3;
      score -= this.failedRequests.length * 5;
      score -= this.silentClicks.length * 2;
      return Math.max(0, score);
    },
    
    // تنظيف
    clear() {
      this.errors = [];
      this.warnings = [];
      this.silentClicks = [];
      this.failedRequests = [];
      console.log('🧹 Bug Detector Cleared');
    }
  };
  
  // تشغيل
  BugDetector.init();
  
  // إتاحة للاستخدام
  window.BugDetector = BugDetector;
  
  console.log('\n📌 Commands:');
  console.log('   BugDetector.report() - عرض التقرير');
  console.log('   BugDetector.clear()  - مسح البيانات');
})();
```

---

## 📖 كيفية الاستخدام

### 1️⃣ تشغيل السكريبت
1. افتح المتصفح على التطبيق
2. اضغط F12 لفتح DevTools
3. اذهب لتبويب Console
4. الصق السكريبت واضغط Enter

### 2️⃣ استخدام التطبيق
- تنقل بين الصفحات
- اضغط على الأزرار
- اضغط على التبويبات
- أدخل بيانات في النماذج
- جرب عمليات CRUD

### 3️⃣ عرض التقرير
```javascript
BugDetector.report()
```

---

## 🔍 ماذا يكتشف السكريبت؟

| النوع | الوصف | الخطورة |
|-------|-------|---------|
| `js_error` | خطأ JavaScript | 🔴 High |
| `promise_rejection` | Promise بدون catch | 🔴 High |
| `failed_request` | طلب شبكة فاشل (4xx/5xx) | 🟠 Medium |
| `slow_request` | طلب أبطأ من 5 ثواني | 🟡 Low |
| `silent_click` | زر/تبويب بدون أثر | 🟠 Medium |

---

## 📊 تفسير النتائج

### النتيجة (Score)
| النتيجة | الحالة | الإجراء |
|---------|--------|---------|
| 90-100 | ممتاز | ✅ جاهز للنشر |
| 70-89 | جيد | ⚠️ أصلح التحذيرات |
| 50-69 | متوسط | 🔶 أصلح الأخطاء |
| < 50 | سيء | 🛑 لا تنشر |

### أمثلة على المشاكل المكتشفة

#### Silent Click (تبويب وهمي)
```
⚠️ Silent Tab: "المستفيدين"
```
**السبب المحتمل:** التبويب يغير CSS فقط بدون تغيير state

#### Failed Request
```
🌐 Failed Request [403]: /api/admin/users
```
**السبب المحتمل:** صلاحيات غير صحيحة

#### Promise Rejection
```
🐛 Unhandled Promise: Cannot read property 'id' of undefined
```
**السبب المحتمل:** بيانات null غير معالجة

---

## 🛠️ سكريبتات إضافية

### فحص التبويبات فقط
```javascript
// يفحص كل التبويبات في الصفحة
document.querySelectorAll('[role="tab"]').forEach(tab => {
  console.log(`Tab: "${tab.textContent}" - onClick: ${tab.onclick ? '✅' : '❌'}`);
});
```

### فحص الأزرار فقط
```javascript
// يفحص كل الأزرار
document.querySelectorAll('button').forEach(btn => {
  const hasHandler = btn.onclick || 
    btn.getAttribute('onClick') || 
    btn.closest('form');
  console.log(`Button: "${btn.textContent.trim().slice(0,30)}" - Handler: ${hasHandler ? '✅' : '⚠️'}`);
});
```

### فحص الروابط المكسورة
```javascript
// يفحص الروابط الداخلية
document.querySelectorAll('a[href^="/"]').forEach(link => {
  fetch(link.href, { method: 'HEAD' })
    .then(r => console.log(`${r.ok ? '✅' : '❌'} ${link.href}`))
    .catch(() => console.log(`❌ ${link.href}`));
});
```

---

## 📝 تسجيل النتائج

### نموذج تقرير الفحص

```
تاريخ الفحص: ____/____/____
الفاحص: ____________

النتيجة: ____/100

الأخطاء المكتشفة:
1. _______________________
2. _______________________

التبويبات الوهمية:
1. _______________________
2. _______________________

الطلبات الفاشلة:
1. _______________________
2. _______________________

الإجراءات المطلوبة:
1. _______________________
2. _______________________
```

---

## ⚠️ ملاحظات مهمة

1. **السكريبت لا يكتشف كل شيء** - يكتشف ~80% من المشاكل الشائعة
2. **يحتاج استخدام فعلي** - كلما استخدمت التطبيق أكثر، اكتشف أكثر
3. **لا يختبر الصلاحيات** - تحتاج اختبار يدوي مع أدوار مختلفة
4. **يعمل في session واحدة** - البيانات تُمسح عند تحديث الصفحة
