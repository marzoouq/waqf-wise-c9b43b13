# 🧪 دليل الاختبارات الشامل

## 📁 هيكل المجلدات

```
src/__tests__/
├── integration/          # اختبارات التكامل (15 سيناريو)
│   ├── financial/       # التدفقات المالية
│   ├── operational/     # التدفقات الوظيفية
│   └── fixtures/        # بيانات وهمية للاختبارات
├── e2e/                 # اختبارات E2E (12 رحلة)
│   ├── admin/          # رحلات الأدوار الإدارية
│   ├── beneficiary/    # رحلات المستفيدين
│   ├── reports/        # رحلات التقارير
│   └── helpers/        # مساعدات E2E
└── fixtures/            # بيانات وهمية مشتركة
```

## 🚀 تشغيل الاختبارات

### Unit Tests (Vitest)
```bash
# تشغيل جميع الاختبارات
npm run test

# تشغيل مع واجهة
npm run test:ui

# تشغيل مع تغطية
npm run test:coverage

# تشغيل في وضع المراقبة
npm run test:watch

# تشغيل مرة واحدة (CI)
npm run test:run
```

### E2E Tests (Playwright)
```bash
# تشغيل اختبارات E2E
npm run e2e

# تشغيل مع واجهة
npm run e2e:ui

# تشغيل مع عرض المتصفح
npm run e2e:headed

# تشغيل متصفح محدد
npx playwright test --project=chromium

# تشغيل ملف محدد
npx playwright test src/__tests__/e2e/admin/nazer-daily-operations.spec.ts
```

## 📊 التغطية المستهدفة

- **Hooks**: > 90%
- **Components**: > 85%
- **Integration**: > 80%
- **E2E Critical Paths**: 100%
- **Edge Functions**: > 75%

## 🎯 أولويات الاختبار

### أسبوع 1-3: Unit Tests (Hooks)
- 70+ hooks للاختبار
- البدء بالـ Hooks الحرجة

### أسبوع 4-7: Unit Tests (Components)
- 100+ مكون للاختبار
- التركيز على المكونات الحرجة

### أسبوع 8-9: Integration Tests
- 15 سيناريو تكامل
- التدفقات المالية والوظيفية

### أسبوع 10-11: E2E Tests
- 12 رحلة مستخدم كاملة
- جميع الأدوار الستة

## 📝 إرشادات كتابة الاختبارات

### 1. تسمية الملفات
```
✅ useBeneficiaries.test.ts
✅ BeneficiaryDialog.test.tsx
✅ distribution-complete-flow.test.ts
✅ nazer-daily-operations.spec.ts
```

### 2. هيكل الاختبار
```typescript
describe('Component/Hook Name', () => {
  it('should do something specific', async () => {
    // Arrange
    // Act
    // Assert
  });
});
```

### 3. استخدام Fixtures
```typescript
import { mockBeneficiary } from '../fixtures/beneficiaries';

const testData = mockBeneficiary({ full_name: 'اختبار' });
```

## 🔧 الأدوات المستخدمة

- **Vitest**: Unit & Integration Tests
- **Playwright**: E2E Tests
- **@testing-library/react**: Component Testing
- **@testing-library/user-event**: User Interactions

## 📈 التقارير

- HTML Report: `playwright-report/index.html`
- Coverage Report: `coverage/index.html`
- JSON Results: `test-results/results.json`
