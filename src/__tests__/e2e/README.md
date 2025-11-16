# 🌐 اختبارات E2E

## الرحلات (12 رحلة)

### رحلات الأدوار الإدارية (6 رحلات)
1. **nazer-daily-operations.spec.ts** - رحلة الناظر اليومية
2. **accountant-full-cycle.spec.ts** - رحلة المحاسب الكاملة
3. **cashier-payments.spec.ts** - رحلة أمين الصندوق
4. **archivist-document-management.spec.ts** - رحلة الأرشيفي
5. **admin-system-management.spec.ts** - رحلة المشرف
6. **multi-approval-workflow.spec.ts** - سير عمل موافقات متعددة

### رحلات المستفيدين والتقارير (6 رحلات)
7. **beneficiary-portal-journey.spec.ts** - بوابة المستفيد
8. **property-rental-management.spec.ts** - إدارة العقارات
9. **loan-complete-lifecycle.spec.ts** - دورة القرض الكاملة
10. **invoice-zatca-workflow.spec.ts** - فواتير ZATCA
11. **advanced-reporting.spec.ts** - التقارير المتقدمة
12. **chatbot-ai-interaction.spec.ts** - المساعد الذكي

## مثال على اختبار E2E

```typescript
import { test, expect } from '@playwright/test';

test.describe('Nazer Daily Operations', () => {
  test('should complete daily tasks', async ({ page }) => {
    // 1. تسجيل الدخول
    await page.goto('/auth');
    await page.fill('[name="email"]', 'nazer@waqf.sa');
    await page.fill('[name="password"]', 'test123');
    await page.click('button[type="submit"]');
    
    // 2. عرض لوحة التحكم
    await expect(page).toHaveURL('/nazer-dashboard');
    
    // 3. مراجعة الموافقات المعلقة
    await page.click('text=الموافقات المعلقة');
    
    // 4. الموافقة على توزيع
    await page.click('button:has-text("مراجعة")').first();
    await page.fill('textarea[name="notes"]', 'موافق');
    await page.click('button:has-text("موافقة")');
    
    await expect(page.locator('text=تمت الموافقة')).toBeVisible();
  });
});
```
