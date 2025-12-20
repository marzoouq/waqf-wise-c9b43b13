# دليل المساهمة في المشروع

## 📋 جدول المحتويات
- [البداية](#البداية)
- [معايير الكود](#معايير-الكود)
- [قواعد ESLint](#قواعد-eslint)
- [Pre-commit Hooks](#pre-commit-hooks)
- [عملية التطوير](#عملية-التطوير)
- [الاختبارات](#الاختبارات)
- [Pull Requests](#pull-requests)

## 🚀 البداية

### المتطلبات الأساسية
- Node.js 18+ أو Bun
- Git
- محرر نصوص (VSCode موصى به)

### إعداد بيئة التطوير

```bash
# استنساخ المشروع
git clone <repository-url>
cd <project-name>

# تثبيت الحزم
bun install

# نسخ ملف البيئة
cp .env.example .env

# تشغيل خادم التطوير
bun dev
```

## 📝 معايير الكود

### TypeScript
- ✅ استخدم TypeScript Strict Mode
- ✅ تجنب استخدام `any` (استخدم `unknown` إذا لزم الأمر)
- ✅ أضف type annotations للدوال العامة
- ✅ استخدم interfaces للكائنات المعقدة

```typescript
// ❌ سيء
function processData(data: any) {
  return data.value;
}

// ✅ جيد
interface DataInput {
  value: string;
  metadata?: Record<string, unknown>;
}

function processData(data: DataInput): string {
  return data.value;
}
```

### تسمية الملفات والمكونات
- المكونات: `PascalCase.tsx` (مثل: `BeneficiaryCard.tsx`)
- الـ Hooks: `use*.ts` (مثل: `useBeneficiaries.ts`)
- الأدوات: `camelCase.ts` (مثل: `formatCurrency.ts`)
- الثوابت: `UPPER_SNAKE_CASE.ts` (مثل: `API_ENDPOINTS.ts`)

### هيكل المكونات

```typescript
import React from 'react';
import { cn } from '@/lib/utils';

interface ComponentNameProps {
  // props here
  className?: string;
}

/**
 * وصف المكون وماذا يفعل
 * @param props - خصائص المكون
 */
export function ComponentName({ className, ...props }: ComponentNameProps) {
  return (
    <div className={cn("base-styles", className)}>
      {/* content */}
    </div>
  );
}
```

### Styling
- ✅ استخدم Tailwind semantic tokens من `index.css`
- ✅ استخدم `cn()` للجمع بين الـ classes
- ❌ تجنب الألوان المباشرة (مثل `text-white`, `bg-blue-500`)
- ✅ استخدم متغيرات CSS (مثل `bg-background`, `text-foreground`)

```typescript
// ❌ سيء
<div className="bg-white text-black border-gray-300">

// ✅ جيد
<div className="bg-background text-foreground border-border">
```

### Logging
- ❌ لا تستخدم `console.log` في الكود النهائي
- ✅ استخدم `productionLogger` من `@/lib/logger/production-logger`

```typescript
import { productionLogger } from '@/lib/logger/production-logger';

// للتطوير فقط
productionLogger.debug('Debug info', { data });

// للإنتاج والتطوير
productionLogger.info('Operation completed', { userId });
productionLogger.warn('Warning message', data, { severity: 'high' });
productionLogger.error('Error occurred', error, { context: 'payment' });
```

### معالجة الأخطاء
استخدم نظام معالجة الأخطاء الموحد:

```typescript
import { handleError, showSuccess } from '@/lib/errors';

try {
  await someAsyncOperation();
  showSuccess('تمت العملية بنجاح');
} catch (error) {
  handleError(error, {
    context: { operation: 'create_beneficiary' },
    severity: 'high',
  });
}
```

## 🔧 قواعد ESLint

### القواعد الصارمة المفعّلة

| القاعدة | المستوى | الوصف |
|---------|---------|-------|
| `@typescript-eslint/no-explicit-any` | `error` | ممنوع استخدام `any` نهائياً |
| `@typescript-eslint/no-empty-function` | `error` | ممنوع الدوال الفارغة |
| `no-console` | `error` | ممنوع `console.log` (مسموح `warn`, `error` فقط) |
| `prefer-const` | `error` | استخدم `const` للمتغيرات الثابتة |
| `no-var` | `error` | ممنوع استخدام `var` |
| `eqeqeq` | `error` | استخدم `===` بدلاً من `==` |
| `no-duplicate-imports` | `error` | ممنوع استيراد نفس الملف مرتين |

### أمثلة على الأخطاء الشائعة

```typescript
// ❌ أخطاء سيتم رفضها
function doNothing() {}                    // no-empty-function
console.log('debug');                      // no-console
let x = 5;                                 // no-var / prefer-const
if (value == null) {}                      // eqeqeq
const data: any = {};                      // no-explicit-any

// ✅ الطريقة الصحيحة
function handleEvent(_e: Event) { /* intentionally empty */ }
productionLogger.debug('debug');
const x = 5;
if (value === null) {}
const data: unknown = {};
```

### تشغيل ESLint

```bash
# فحص عادي
npm run lint

# فحص صارم (بدون تحذيرات)
npm run lint:strict

# إصلاح تلقائي
npm run lint -- --fix
```

## 🔒 Pre-commit Hooks

### ما يحدث عند كل commit

عند تنفيذ `git commit`، يتم تشغيل الفحوصات التالية تلقائياً:

```
1. 📘 TypeScript Check    → tsc --noEmit
2. 🧪 Quick Tests         → npm run test:unit
3. ✨ Lint + Format       → eslint --fix --max-warnings=0 + prettier
```

### سلوك الفحوصات

| الفحص | يوقف الـ commit؟ | ملاحظات |
|-------|-----------------|---------|
| TypeScript | ✅ نعم | أي خطأ type يمنع الـ commit |
| ESLint | ✅ نعم | أي خطأ أو تحذير يمنع الـ commit |
| Prettier | ❌ لا | يتم الإصلاح التلقائي |
| Unit Tests | ⚠️ تحذير | يستمر حتى لو فشلت |

### تجاوز الفحوصات (للطوارئ فقط!)

```bash
# ⚠️ استخدم فقط في حالات الطوارئ
git commit --no-verify -m "fix: urgent hotfix"
```

### تشغيل الفحوصات يدوياً

```bash
# فحص TypeScript
npm run typecheck

# فحص كامل قبل النشر
npm run deploy:check
```

## 🔄 عملية التطوير

### Git Workflow

1. أنشئ branch جديد للميزة:
```bash
git checkout -b feature/feature-name
```

2. اكتب كود نظيف ومنظم

3. اختبر التغييرات:
```bash
bun test
bun lint
```

4. Commit التغييرات:
```bash
git add .
git commit -m "feat: add new feature"
```

### Commit Message Convention
نتبع [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` ميزة جديدة
- `fix:` إصلاح bug
- `docs:` تحديث التوثيق
- `style:` تنسيق الكود (بدون تغيير منطقي)
- `refactor:` إعادة هيكلة الكود
- `test:` إضافة أو تحديث الاختبارات
- `chore:` تحديثات صيانة

أمثلة:
```
feat: add beneficiary search functionality
fix: resolve date formatting in reports
docs: update API documentation
refactor: split Accounting component into smaller parts
```

## 🧪 الاختبارات

### تشغيل الاختبارات
```bash
# جميع الاختبارات
bun test

# اختبارات محددة
bun test src/components/beneficiaries

# مع coverage
bun test --coverage

# E2E tests
bun test:e2e
```

### كتابة الاختبارات
```typescript
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ComponentName } from './ComponentName';

describe('ComponentName', () => {
  it('should render correctly', () => {
    render(<ComponentName />);
    expect(screen.getByText('Expected Text')).toBeInTheDocument();
  });

  it('should handle user interaction', async () => {
    const { user } = render(<ComponentName />);
    await user.click(screen.getByRole('button'));
    expect(screen.getByText('Success')).toBeInTheDocument();
  });
});
```

## 📤 Pull Requests

### قبل إنشاء PR

- [ ] تأكد من نجاح جميع الاختبارات
- [ ] تأكد من عدم وجود أخطاء lint
- [ ] تأكد من عدم وجود أخطاء TypeScript
- [ ] أضف/حدّث الاختبارات إذا لزم الأمر
- [ ] أضف/حدّث التوثيق إذا لزم الأمر

### قالب PR

```markdown
## الوصف
وصف مختصر للتغييرات

## نوع التغيير
- [ ] ميزة جديدة
- [ ] إصلاح bug
- [ ] تحسين أداء
- [ ] إعادة هيكلة
- [ ] تحديث توثيق

## الاختبارات
- [ ] تم اختبار التغييرات يدوياً
- [ ] تم إضافة/تحديث unit tests
- [ ] تم إضافة/تحديث E2E tests

## Screenshots (إن وجدت)
أضف screenshots للتغييرات البصرية

## ملاحظات إضافية
أي ملاحظات إضافية للمراجعين
```

## 📚 موارد إضافية

- [React Best Practices](https://react.dev/learn)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Vitest Documentation](https://vitest.dev/)

## 🤝 كود المساهمين

- كن محترماً ومهنياً
- اقبل التعليقات البناءة
- ساعد الآخرين
- اكتب كوداً نظيفاً وموثقاً

---

شكراً لمساهمتك! 🎉
