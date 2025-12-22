# 📁 Lib Directory / مجلد المكتبات

هذا المجلد يحتوي على الأدوات المساعدة والمكتبات المشتركة للمشروع.

## 📂 الهيكل

```
src/lib/
├── index.ts              # تصدير مركزي
├── utils/                # أدوات المنفعة العامة
├── pdf/                  # مولدات PDF
├── banking/              # العمليات البنكية
├── cache/                # إدارة الذاكرة المؤقتة
├── optimization/         # التحسين والأداء
├── debug/                # أدوات التصحيح
├── archive/              # الأرشفة
├── distribution/         # محرك التوزيعات
├── export/               # أدوات التصدير
├── logger/               # نظام السجلات
├── error-tracking/       # تتبع الأخطاء
└── performance/          # الأداء
```

## 📋 المحتويات

### 🔧 utils/
أدوات المنفعة العامة:
- `arrays.ts` - دوال المصفوفات
- `array-safe.ts` - دوال المصفوفات الآمنة
- `formatting.ts` - تنسيق البيانات
- `validation.ts` - التحقق من الصحة
- `cleanFilters.ts` - تنظيف الفلاتر
- `supabaseHelpers.ts` - مساعدات Supabase
- `safeJson.ts` - JSON آمن
- `retry.ts` - إعادة المحاولة

### 📄 pdf/
مولدات ملفات PDF:
- `pdfGenerator.ts` - مولد PDF الرئيسي
- `reportPdfGenerator.ts` - تقارير PDF
- `paymentVoucherPdf.ts` - سندات الصرف PDF

### 🏦 banking/
العمليات البنكية:
- `bankTransferGenerator.ts` - توليد ملفات التحويل
- `bankFileFormats.ts` - صيغ ملفات البنوك
- `sadadIntegration.ts` - تكامل سداد

### 💾 cache/
إدارة الذاكرة المؤقتة:
- `clearCache.ts` - تنظيف الكاش
- `cleanupAlerts.ts` - تنظيف التنبيهات

### ⚡ optimization/
التحسين والأداء:
- `imageOptimization.ts` - تحسين الصور
- `performanceOptimization.ts` - تحسينات الأداء
- `memoryOptimization.ts` - تحسين الذاكرة
- `lazyLoadOptimization.ts` - تحسين التحميل الكسول

### 🐛 debug/
أدوات التصحيح:
- `diagnostics.ts` - التشخيصات
- `healthCheck.ts` - فحص الصحة
- `selfHealing.ts` - الإصلاح التلقائي

### 📁 archive/
الأرشفة:
- `archiveHelpers.ts` - مساعدات الأرشفة

### 📊 distribution/
محرك التوزيعات:
- `distributionEngine.ts` - محرك التوزيع

### 📤 export/
أدوات التصدير:
- `exportHelpers.ts` - مساعدات التصدير

## 🔄 طرق الاستيراد

### 1. من الـ index الرئيسي
```typescript
import { formatCurrency, generatePDF } from '@/lib';
```

### 2. من المجلد الفرعي
```typescript
import { generateReportPDF } from '@/lib/pdf';
import { formatNumber, formatDate } from '@/lib/utils';
```

### 3. من الملف المباشر
```typescript
import { generateBankTransferFile } from '@/lib/banking/bankTransferGenerator';
```

---

**آخر تحديث:** 2025-12-22
**الإصدار:** 3.1.0
