# 🧪 دليل الاختبار الشامل لمنصة إدارة الوقف

## 📋 نظرة عامة

يحتوي هذا المشروع على مجموعة شاملة من الاختبارات تغطي جميع جوانب النظام:

### ✅ الإحصائيات الحالية
```
E2E Tests:             12/12 (100%) ✅
Integration Tests:     15/15 (100%) ✅
Unit Tests:            0/70 (0%) 🔄
Component Tests:       0/100 (0%) 📋
───────────────────────────────────
الإجمالي:             27/197 (40%)
```

---

## 🎯 أنواع الاختبارات

### 1️⃣ E2E Tests (اختبارات شاملة)
اختبارات متكاملة تحاكي تجربة المستخدم الكاملة

**الموقع**: `src/__tests__/e2e/`

#### الأدوار المغطاة (6 أدوار):
- ✅ **الناظر** - عمليات يومية شاملة
- ✅ **المحاسب** - دورة محاسبية متكاملة
- ✅ **أمين الصندوق** - معالجة المدفوعات
- ✅ **الأرشيفي** - إدارة المستندات
- ✅ **المشرف** - إدارة النظام
- ✅ **المستفيد** - بوابة المستفيدين

#### الرحلات المتقدمة:
- ✅ إدارة العقارات والإيجارات
- ✅ دورة القرض الكاملة
- ✅ فواتير ZATCA
- ✅ التقارير المتقدمة
- ✅ المساعد الذكي AI
- ✅ موافقات متعددة المستويات

### 2️⃣ Integration Tests (اختبارات التكامل)
اختبارات تدفقات العمل المعقدة

**الموقع**: `src/__tests__/integration/`

#### التدفقات المالية (8):
1. ✅ دورة التوزيع الكاملة
2. ✅ دورة الإيجارات
3. ✅ إنشاء الفواتير والدفع
4. ✅ التسوية البنكية
5. ✅ ترحيل القيود
6. ✅ تجديد العقود
7. ✅ دورة القرض
8. ✅ الدفع مع المحاسبة

#### التدفقات التشغيلية (7):
1. ✅ طلب الصيانة
2. ✅ إدارة العائلات
3. ✅ أرشفة OCR
4. ✅ تصعيد الموافقات
5. ✅ تعاون متعدد الأدوار
6. ✅ رؤى AI
7. ✅ معالجة طلبات المستفيدين

### 3️⃣ Unit Tests (اختبارات الوحدات)
اختبارات للـ Hooks والوظائف

**الموقع**: `src/hooks/__tests__/`

**الحالة**: 🔄 قيد التطوير

---

## 📁 هيكل المجلدات

```
src/__tests__/
├── e2e/                          # اختبارات E2E
│   ├── admin/                    # رحلات الأدوار الإدارية
│   │   ├── nazer-daily-operations.spec.ts
│   │   ├── accountant-full-cycle.spec.ts
│   │   ├── cashier-payments.spec.ts
│   │   ├── archivist-document-management.spec.ts
│   │   ├── admin-system-management.spec.ts
│   │   └── multi-approval-workflow.spec.ts
│   ├── beneficiary/              # رحلات المستفيدين
│   │   └── beneficiary-portal-journey.spec.ts
│   ├── reports/                  # رحلات متقدمة
│   │   ├── property-rental-management.spec.ts
│   │   ├── loan-complete-lifecycle.spec.ts
│   │   ├── invoice-zatca-workflow.spec.ts
│   │   ├── advanced-reporting.spec.ts
│   │   └── chatbot-ai-interaction.spec.ts
│   └── helpers/                  # أدوات مساعدة
│       ├── auth-helpers.ts       # تسجيل الدخول
│       ├── navigation-helpers.ts # التنقل
│       └── form-helpers.ts       # النماذج
│
├── integration/                  # اختبارات التكامل
│   ├── financial/                # تدفقات مالية
│   │   ├── distribution-complete-flow.test.ts
│   │   ├── rental-payment-cycle.test.ts
│   │   ├── invoice-generation-payment.test.ts
│   │   ├── bank-reconciliation-flow.test.ts
│   │   ├── journal-entry-posting.test.ts
│   │   └── contract-renewal-payments.test.ts
│   └── operational/              # تدفقات تشغيلية
│       ├── maintenance-request-workflow.test.ts
│       ├── beneficiary-family-management.test.ts
│       ├── document-archiving-ocr.test.ts
│       ├── approval-escalation.test.ts
│       ├── multi-role-collaboration.test.ts
│       └── ai-insights-generation.test.ts
│
└── fixtures/                     # بيانات اختبار
    ├── beneficiaries.ts
    ├── distributions.ts
    ├── journal-entries.ts
    ├── users.ts
    ├── payments.ts
    ├── properties.ts
    ├── accounts.ts
    └── families.ts
```

## 🚀 تشغيل الاختبارات

### E2E Tests (Playwright)

```bash
# تشغيل جميع اختبارات E2E
npm run e2e

# تشغيل بواجهة رسومية
npm run e2e:ui

# تشغيل متصفح محدد
npm run e2e -- --project=chromium

# تشغيل ملف محدد
npm run e2e -- src/__tests__/e2e/admin/nazer-daily-operations.spec.ts

# وضع التصحيح
npm run e2e -- --debug
```

### Integration Tests (Vitest)

```bash
# تشغيل اختبارات التكامل
npm run test src/__tests__/integration/

# التدفقات المالية فقط
npm run test src/__tests__/integration/financial/

# التدفقات التشغيلية فقط
npm run test src/__tests__/integration/operational/

# ملف محدد
npm run test src/__tests__/integration/financial/distribution-complete-flow.test.ts

# مع التغطية
npm run test:coverage src/__tests__/integration/
```

### Unit Tests (Vitest)

```bash
# تشغيل جميع اختبارات الوحدات
npm run test

# مع التغطية
npm run test:coverage

# وضع المراقبة
npm run test:watch

# واجهة رسومية
npm run test:ui
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
