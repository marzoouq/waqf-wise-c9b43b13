import { test, expect } from '@playwright/test';

/**
 * اختبار خاص لإضافة البيانات الوهمية للقاعدة
 * يتم تشغيله مرة واحدة قبل جميع الاختبارات
 */

test.describe.configure({ mode: 'serial' });

test.describe('إعداد البيانات الوهمية', () => {
  test('إضافة بيانات وهمية للقاعدة', async ({ page }) => {
    await page.goto('/');
    
    // استدعاء دالة إضافة البيانات
    const result = await page.evaluate(async () => {
      // استيراد الدالة ديناميكياً
      const { seedTestData } = await import('../../seed-test-data');
      return await seedTestData();
    });

    expect(result.success).toBe(true);
    
    console.log('📊 إحصائيات البيانات المضافة:');
    console.log(`   - المستفيدون: ${result.counts.beneficiaries}`);
    console.log(`   - العقارات: ${result.counts.properties}`);
    console.log(`   - التوزيعات: ${result.counts.distributions}`);
    console.log(`   - الحسابات: ${result.counts.accounts}`);
    console.log(`   - القيود: ${result.counts.journalEntries}`);
    console.log(`   - أنواع الطلبات: ${result.counts.requestTypes}`);
    console.log(`   - المستندات: ${result.counts.documents}`);
  });
});
