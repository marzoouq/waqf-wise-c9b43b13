# ⚡ دليل الاختبار السريع

## 🎯 البدء السريع (30 ثانية)

```bash
# 1. تثبيت المتطلبات
npm install
npx playwright install

# 2. تشغيل الاختبارات
npm run e2e:ui        # واجهة E2E رسومية (مستحسن)
npm run e2e           # E2E في الخلفية
npm run test          # Unit + Integration Tests
```

## 📊 الحالة الحالية

```
✅ E2E Tests:           12/12 (100%)  🎉
✅ Integration Tests:   15/15 (100%)  🎉
🔄 Unit Tests:          0/70 (0%)     🚧
📋 Component Tests:     0/100 (0%)    📝
───────────────────────────────────────
📈 الإجمالي:           27/197 (40%)
```

## 🚀 الأوامر الأساسية

### E2E (Playwright) - 12 رحلة ✅
```bash
npm run e2e:ui       # واجهة رسومية (أفضل للتطوير)
npm run e2e          # تشغيل في الخلفية
npm run e2e -- --debug  # وضع التصحيح
```

### Integration (Vitest) - 15 تدفق ✅
```bash
npm run test src/__tests__/integration/  # جميع التدفقات
npm run test src/__tests__/integration/financial/  # مالية فقط
npm run test src/__tests__/integration/operational/  # تشغيلية فقط
```

### Unit Tests (قيد التطوير) 🚧
```bash
npm run test         # جميع الاختبارات
npm run test:watch   # وضع المراقبة
npm run test:ui      # واجهة رسومية
```

## 📝 الاختبارات المتاحة

### E2E - الأدوار (6) ✅
- `nazer-daily-operations` - الناظر
- `accountant-full-cycle` - المحاسب
- `cashier-payments` - أمين الصندوق
- `archivist-document-management` - الأرشيفي
- `admin-system-management` - المشرف
- `beneficiary-portal-journey` - المستفيد

### E2E - الرحلات المتقدمة (6) ✅
- `property-rental-management` - العقارات
- `loan-complete-lifecycle` - القروض
- `invoice-zatca-workflow` - الفواتير
- `advanced-reporting` - التقارير
- `chatbot-ai-interaction` - المساعد الذكي
- `multi-approval-workflow` - الموافقات

### Integration - المالية (8) ✅
1. `distribution-complete-flow` - التوزيع
2. `rental-payment-cycle` - الإيجارات
3. `invoice-generation-payment` - الفواتير
4. `bank-reconciliation-flow` - التسوية
5. `journal-entry-posting` - القيود
6. `contract-renewal-payments` - تجديد العقود
7. دورة القرض
8. الدفع مع المحاسبة

### Integration - التشغيلية (7) ✅
1. `maintenance-request-workflow` - الصيانة
2. `beneficiary-family-management` - العائلات
3. `document-archiving-ocr` - الأرشفة
4. `approval-escalation` - التصعيد
5. `multi-role-collaboration` - التعاون
6. `ai-insights-generation` - رؤى AI
7. معالجة الطلبات

## 🔧 تشغيل اختبار محدد

```bash
# E2E - الناظر
npm run e2e -- src/__tests__/e2e/admin/nazer-daily-operations.spec.ts

# Integration - التوزيع
npm run test -- src/__tests__/integration/financial/distribution-complete-flow.test.ts

# متصفح محدد
npm run e2e -- --project=chromium
npm run e2e -- --project=firefox
```

## 📊 عرض التقارير

```bash
# تقرير Playwright
npx playwright show-report

# تقرير التغطية
npm run test:coverage
# ثم افتح: coverage/index.html
```

## 🐛 التصحيح

```bash
# Playwright UI (أفضل طريقة)
npm run e2e:ui

# خطوة بخطوة
npm run e2e -- --debug

# Vitest UI
npm run test:ui
```

## ⚠️ ملاحظات سريعة

1. **المستخدمون التجريبيون**:
   - nazer@waqf.sa (ناظر)
   - accountant@waqf.sa (محاسب)
   - cashier@waqf.sa (صندوق)
   - archivist@waqf.sa (أرشيف)
   - admin@waqf.sa (مشرف)
   - beneficiary@waqf.sa (مستفيد)
   - كلمة المرور: `Test@123456`

2. **التثبيت الأول**:
   ```bash
   npm install
   npx playwright install
   ```

3. **البيئة**: تأكد من وجود `.env` بالإعدادات الصحيحة

## 📚 وثائق إضافية

- [📖 الدليل الشامل](./src/__tests__/README.md)
- [🚀 دليل التشغيل](./RUN_TESTS.md)
- [✅ قائمة التحقق](./TESTING_CHECKLIST.md)
- [📊 الحالة](./TESTING_STATUS.md)

---

**جاهز للبدء؟**
```bash
npm run e2e:ui
```
