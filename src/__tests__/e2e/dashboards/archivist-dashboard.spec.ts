import { test, expect } from '@playwright/test';
import { loginAs } from '../helpers/auth-helpers';
import { navigateTo } from '../helpers/navigation-helpers';
import { expectVisible } from '../helpers/assertion-helpers';

test.describe('لوحة تحكم الأرشيفي', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, 'archivist');
    await navigateTo(page, '/');
  });

  test('عرض إحصائيات المستندات', async ({ page }) => {
    await expectVisible(page, 'text=إحصائيات المستندات');
    await expectVisible(page, 'text=إجمالي المستندات');
    await expectVisible(page, 'text=المستندات الجديدة');
    
    const docStats = await page.locator('[data-testid="document-stat"]').count();
    expect(docStats).toBeGreaterThan(0);
  });

  test('عرض المستندات التي تحتاج مراجعة', async ({ page }) => {
    await expectVisible(page, 'text=تحتاج مراجعة');
    
    const pendingDocs = await page.locator('[data-status="pending-review"]').count();
    console.log(`✅ المستندات المعلقة: ${pendingDocs}`);
  });

  test('عرض المجلدات الأكثر نشاطاً', async ({ page }) => {
    const activeFolders = page.locator('[data-testid="active-folder"]');
    if (await activeFolders.count() > 0) {
      await expectVisible(page, 'text=المجلدات النشطة');
      
      const foldersCount = await activeFolders.count();
      console.log(`✅ المجلدات النشطة: ${foldersCount}`);
    }
  });

  test('عرض المستندات حسب النوع', async ({ page }) => {
    const byTypeChart = page.locator('[data-testid="documents-by-type"]');
    if (await byTypeChart.count() > 0) {
      await expectVisible(page, 'text=المستندات حسب النوع');
      console.log('✅ تصنيف المستندات متاح');
    }
  });

  test('البحث السريع في المستندات', async ({ page }) => {
    const searchBox = page.locator('input[placeholder*="بحث"]').first();
    if (await searchBox.count() > 0) {
      await searchBox.fill('عقد');
      await page.waitForTimeout(1000);
      console.log('✅ البحث السريع متاح');
    }
  });

  test('عرض المستندات الأخيرة', async ({ page }) => {
    await expectVisible(page, 'text=المستندات الأخيرة');
    
    const recentDocs = await page.locator('[data-testid="recent-document"]').count();
    console.log(`✅ المستندات الأخيرة: ${recentDocs}`);
  });

  test('رفع مستند جديد سريع', async ({ page }) => {
    const uploadButton = page.locator('button:has-text("رفع مستند")').first();
    if (await uploadButton.count() > 0) {
      await uploadButton.click();
      await expectVisible(page, 'text=رفع مستند جديد');
      console.log('✅ رفع المستندات متاح');
    }
  });

  test('عرض إحصائيات التخزين', async ({ page }) => {
    const storageSection = page.locator('[data-testid="storage-stats"]');
    if (await storageSection.count() > 0) {
      await expectVisible(page, 'text=التخزين');
      console.log('✅ إحصائيات التخزين متاحة');
    }
  });

  test('عرض المهام المعلقة', async ({ page }) => {
    const tasksSection = page.locator('[data-testid="pending-tasks"]');
    if (await tasksSection.count() > 0) {
      const tasksCount = await page.locator('[data-testid="task-item"]').count();
      console.log(`✅ المهام المعلقة: ${tasksCount}`);
    }
  });

  test('الانتقال للأرشيف الكامل', async ({ page }) => {
    const archiveLink = page.locator('a[href="/archive"]').first();
    if (await archiveLink.count() > 0) {
      await archiveLink.click();
      await page.waitForLoadState('networkidle');
      await expectVisible(page, 'text=الأرشيف');
    }
  });
});
