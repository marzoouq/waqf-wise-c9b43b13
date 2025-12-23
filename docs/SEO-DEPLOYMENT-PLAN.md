# خطة SEO والنشر للنطاق waqf-ba7r.store

## ✅ المرحلة 1: الإصلاحات الأساسية (مكتملة)

| # | المهمة | الحالة |
|---|--------|--------|
| 1 | إصلاح SEOHead.tsx - إضافة SITE_URL و canonical | ✅ |
| 2 | إصلاح index.html - تحديث canonical و og:image | ✅ |
| 3 | إصلاح waqf-identity.ts - تغيير website | ✅ |
| 4 | إصلاح cors.ts - إضافة النطاق الجديد | ✅ |
| 5 | إنشاء manifest.webmanifest | ✅ |
| 6 | إنشاء sitemap.xml | ✅ |
| 7 | تحديث robots.txt | ✅ |
| 8 | تكوين SITE_URL | ✅ (hardcoded) |

---

## ⏳ المرحلة 2: ما بعد النشر (قيد الانتظار)

### 2.1 النشر
- [ ] نشر التحديثات عبر زر "Publish"

### 2.2 اختبارات ما بعد النشر
- [ ] فحص `https://waqf-ba7r.store/robots.txt`
- [ ] فحص `https://waqf-ba7r.store/sitemap.xml`
- [ ] فحص manifest في DevTools → Application → Manifest
- [ ] فحص canonical في Inspect Element → `<link rel="canonical">`
- [ ] فحص og:image بمشاركة الرابط على WhatsApp

### 2.3 Google Search Console
- [ ] إضافة `https://waqf-ba7r.store` كخاصية جديدة
- [ ] التحقق من الملكية (DNS أو HTML file)
- [ ] إرسال sitemap: `https://waqf-ba7r.store/sitemap.xml`
- [ ] طلب فهرسة الصفحة الرئيسية

---

## 🔄 المرحلة 3: تحسينات إضافية (اختيارية)

### 3.1 Redirect 301
- [ ] إعداد تحويل من `*.lovable.app` إلى النطاق الجديد

### 3.2 تحسين sitemap.xml
- [ ] إضافة جميع الصفحات العامة
- [ ] إضافة lastmod و priority

### 3.3 Structured Data (Schema.org)
- [ ] إضافة Organization schema
- [ ] إضافة BreadcrumbList schema

### 3.4 Performance
- [x] فحص Core Web Vitals
- [x] تحسين LCP و CLS
- [x] تحسين Tree Shaking (Vite + Terser)
- [x] فصل Lucide Icons في chunk منفصل

---

## ✅ قائمة الفحص النهائية (Post-Deployment Validation)

### 1. اختبار الخطوط (Network Tab)
- [ ] افتح الموقع في Incognito Mode
- [ ] F12 → Network → Filter: Font
- [ ] تأكد: جميع الخطوط **Status 200**
- [ ] أعد التحميل وتأكد: **disk cache** أو **memory cache**
- [ ] تحقق من عدم وجود مسارات `node_modules` في الطلبات

### 2. اختبار Lighthouse
| المقياس | الهدف | الحد الأقصى |
|---------|-------|-------------|
| Performance | ≥ 90 | - |
| FCP | ≤ 1.8s | 2.0s |
| LCP | ≤ 2.5s | 3.0s |
| CLS | ≤ 0.1 | 0.15 |
| TBT | ≤ 200ms | 300ms |

### 3. اختبار SEO
- [ ] Structured Data موجود (Organization + WebSite + BreadcrumbList)
- [ ] sitemap.xml يحتوي على جميع الصفحات
- [ ] robots.txt صحيح ويشير إلى sitemap
- [ ] canonical URLs صحيحة
- [ ] Open Graph tags موجودة

### 4. التحقق البصري
- [ ] خط Cairo يظهر بشكل صحيح
- [ ] لا يوجد FOIT (وميض النص)
- [ ] الصور تُحمّل بشكل lazy
- [ ] لا توجد أخطاء في Console

### 5. اختبار الأمان
- [ ] Security Headers موجودة (X-Frame-Options, CSP, etc.)
- [ ] CORS headers للخطوط (Access-Control-Allow-Origin: *)
- [ ] HTTPS مُفعّل

---

## 📝 ملاحظات

- **النطاق الرسمي:** `https://waqf-ba7r.store`
- **تاريخ آخر تحديث:** 2025-12-23
- **الملفات المعدلة:**
  - `src/components/shared/SEOHead.tsx`
  - `index.html`
  - `src/lib/waqf-identity.ts`
  - `supabase/functions/_shared/cors.ts`
  - `public/manifest.webmanifest` (جديد)
  - `public/sitemap.xml` (جديد)
  - `public/robots.txt`
  - `vite.config.ts` (تحسينات Terser + Tree Shaking)

---

## 🧪 الاختبارات الآلية

تم إضافة اختبارات أداء للتحقق التلقائي:
- `src/__tests__/performance/fonts-and-resources.test.ts` - اختبارات الخطوط والموارد
- `src/__tests__/e2e/final-validation.test.ts` - اختبارات الفحص النهائي

لتشغيل الاختبارات:
```bash
npm run test
```

---

## 🔗 روابط مفيدة

- [Google Search Console](https://search.google.com/search-console)
- [PageSpeed Insights](https://pagespeed.web.dev/)
- [Rich Results Test](https://search.google.com/test/rich-results)
- [Mobile-Friendly Test](https://search.google.com/test/mobile-friendly)
- [WebPageTest](https://www.webpagetest.org/)
