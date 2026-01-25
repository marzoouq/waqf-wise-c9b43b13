# تحليل تبعيات المشروع - Waqf Platform

**آخر تحديث:** 2026-01-17  
**تمت المراجعة بواسطة:** فحص معماري شامل

---

## ملخص التحسينات المنفذة

### الحزم المُزالة (18 حزمة)

| الحزمة | السبب |
|--------|-------|
| `@sentry/react` | غير مستخدمة، لا ملفات config |
| `@vitejs/plugin-react` | المشروع يستخدم `@vitejs/plugin-react-swc` |
| `bidi-js` | Type definitions فقط، لا استخدام فعلي |
| `embla-carousel-react` | لا يوجد carousel في المشروع |
| `input-otp` | تنفيذ مخصص موجود في `src/components/ui/input-otp.tsx` |
| `otpauth` | غير مستخدمة |
| `react-hotkeys-hook` | غير مستخدمة |
| `react-is` | غير مستخدمة في React 18 |
| `react-resizable-panels` | غير مستخدمة |
| `vite-plugin-pwa` | غير مفعّل في vite.config |
| `web-vitals` | غير مستخدمة |
| `workbox-window` | نصوص تنظيف فقط |
| `@radix-ui/react-aspect-ratio` | غير مستخدمة |
| `@radix-ui/react-context-menu` | غير مستخدمة |
| `@radix-ui/react-hover-card` | غير مستخدمة |
| `@radix-ui/react-menubar` | غير مستخدمة |
| `@radix-ui/react-navigation-menu` | غير مستخدمة |
| `@radix-ui/react-toggle-group` | غير مستخدمة |

### الملفات المحذوفة (7 ملفات)

| الملف | السبب |
|-------|-------|
| `src/components/ui/hover-card.tsx` | 0 استيرادات |
| `src/components/ui/aspect-ratio.tsx` | 0 استيرادات |
| `src/components/ui/context-menu.tsx` | 0 استيرادات |
| `src/components/ui/menubar.tsx` | 0 استيرادات |
| `src/components/ui/toggle-group.tsx` | 0 استيرادات |
| `src/components/ui/navigation-menu.tsx` | 0 استيرادات |
| `src/types/bidi-js.d.ts` | الحزمة أُزيلت |

---

## التبعيات الأساسية المستخدمة

### إطار العمل الأساسي

| الحزمة | الاستخدام | ملاحظات |
|--------|----------|---------|
| `react` | إطار UI الأساسي | v18.3.1 |
| `react-dom` | React DOM renderer | v18.3.1 |
| `react-router-dom` | التنقل والمسارات | v7.6.1 |
| `@tanstack/react-query` | إدارة الحالة والـ caching | v5.90.9 |

### واجهة المستخدم (UI)

| الحزمة | الاستخدام | ملاحظات |
|--------|----------|---------|
| `tailwindcss` | التنسيق | مع `tailwind-merge` |
| `class-variance-authority` | Variants للمكونات | مستخدم بكثافة |
| `lucide-react` | الأيقونات | v0.553.0 |
| `framer-motion` | الحركات والانتقالات | v12.23.24 |
| `sonner` | إشعارات Toast | v1.7.4 |

### Radix UI (المستخدمة)

| الحزمة | الاستخدام |
|--------|----------|
| `@radix-ui/react-dialog` | النوافذ المنبثقة |
| `@radix-ui/react-dropdown-menu` | القوائم المنسدلة |
| `@radix-ui/react-popover` | Popovers |
| `@radix-ui/react-select` | قوائم الاختيار |
| `@radix-ui/react-tabs` | التبويبات |
| `@radix-ui/react-toast` | إشعارات |
| `@radix-ui/react-tooltip` | تلميحات |
| `@radix-ui/react-accordion` | Accordions |
| `@radix-ui/react-avatar` | صور المستخدمين |
| `@radix-ui/react-checkbox` | مربعات الاختيار |
| `@radix-ui/react-label` | Labels |
| `@radix-ui/react-progress` | شريط التقدم |
| `@radix-ui/react-radio-group` | Radio buttons |
| `@radix-ui/react-scroll-area` | مناطق التمرير |
| `@radix-ui/react-separator` | الفواصل |
| `@radix-ui/react-slider` | شريط التمرير |
| `@radix-ui/react-switch` | المفاتيح |
| `@radix-ui/react-toggle` | Toggle buttons |
| `@radix-ui/react-collapsible` | المناطق القابلة للطي |
| `@radix-ui/react-alert-dialog` | تنبيهات |
| `@radix-ui/react-slot` | Slot pattern |
| `@radix-ui/react-visually-hidden` | Accessibility |

### التقارير والملفات

| الحزمة | الاستخدام |
|--------|----------|
| `jspdf` | إنشاء PDF |
| `jspdf-autotable` | جداول PDF |
| `exceljs` | ملفات Excel |
| `qrcode` | رموز QR |

### أدوات أخرى

| الحزمة | الاستخدام |
|--------|----------|
| `date-fns` | معالجة التواريخ |
| `zod` | التحقق من البيانات |
| `react-hook-form` | إدارة النماذج |
| `dompurify` | تنظيف HTML |
| `react-markdown` | عرض Markdown |
| `cmdk` | البحث الشامل (Command palette) |
| `recharts` | الرسوم البيانية |

### Supabase

| الحزمة | الاستخدام |
|--------|----------|
| `@supabase/supabase-js` | الاتصال بقاعدة البيانات |

---

## أدوات التطوير (devDependencies)

الحزم التالية يجب أن تكون في devDependencies:

- `@axe-core/playwright` - اختبارات الوصولية
- `@playwright/test` - اختبارات E2E
- `@testing-library/*` - اختبارات الوحدات
- `@vitest/*` - إطار الاختبارات
- `@types/dompurify` - أنواع TypeScript
- `husky` - Git hooks
- `lint-staged` - Linting
- `prettier` - تنسيق الكود
- `jsdom` - بيئة اختبار
- `terser` - ضغط الكود
- `cssnano` - ضغط CSS

---

## إرشادات الصيانة

### قبل إضافة حزمة جديدة

1. تحقق من وجود بديل مُدمج
2. تحقق من حجم الحزمة على [bundlephobia.com](https://bundlephobia.com)
3. تحقق من آخر تحديث وعدد التنزيلات
4. تحقق من عدم وجود ثغرات أمنية

### مراجعة دورية

- مراجعة التبعيات كل 3 أشهر
- تحديث الحزم الأمنية فورًا
- إزالة الحزم غير المستخدمة

---

## سجل التحديثات

| التاريخ | التغيير |
|---------|---------|
| 2026-01-17 | إزالة 18 حزمة غير مستخدمة، حذف 7 ملفات |
