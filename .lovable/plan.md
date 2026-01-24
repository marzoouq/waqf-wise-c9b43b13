

# خطة إصلاح ثغرة CodeQL في ملف الاختبار

## المشكلة
تنبيه CodeQL بمستوى **عالي الخطورة** يشير إلى ثغرة **CWE-20/CWE-80** في ملف الاختبار بسبب regex غير آمن لتنظيف وسوم `<script>`.

## الملف المتأثر
`src/__tests__/security/input-validation.test.ts` - السطور 20-23

## التغيير المطلوب

### قبل (الكود الحالي - خطير):
```typescript
const sanitized = input
  .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
  .replace(/javascript:/gi, '')
  .replace(/on\w+=/gi, '');
```

### بعد (الكود المُصحح - آمن):
```typescript
const sanitized = input
  // إزالة جميع الأقواس الزاوية لمنع ظهور أي علامات HTML
  .replace(/[<>]/g, '')
  // إزالة بروتوكول javascript:
  .replace(/javascript:/gi, '')
  // إزالة سمات معالج الأحداث (onclick=, onload=, etc.)
  .replace(/on\w+=/gi, '');
```

## لماذا هذا الإصلاح أفضل؟

| النهج القديم | النهج الجديد |
|-------------|-------------|
| regex معقد يحاول مطابقة `<script>...</script>` | إزالة كل `<` و `>` |
| يفشل مع الوسوم المتداخلة | يعالج جميع الحالات |
| `<scr<script>ipt>` → يترك `<script>` | `<scr<script>ipt>` → `scrscriptipt` |

## سيناريوهات الاختبار بعد الإصلاح

| المدخل | النتيجة المتوقعة |
|--------|-----------------|
| `<script>alert(1)</script>` | `scriptalert(1)/script` |
| `<scr<script>ipt>alert(1)</script>` | `scrscriptipt...` (بدون `<`) |
| `<img onerror=alert(1)>` | `img alert(1)` |
| `javascript:alert(1)` | `alert(1)` |

## خطوات التنفيذ

1. تحديث السطور 20-23 في الملف
2. تشغيل الاختبارات للتحقق: `npm run test`
3. دفع التغييرات للمستودع
4. التحقق من إغلاق تنبيه CodeQL تلقائياً

## الملفات المتأثرة
- `src/__tests__/security/input-validation.test.ts` (تعديل السطور 20-23)

## الوقت المتوقع
5 دقائق

