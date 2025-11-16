import { test, expect } from '@playwright/test';
import { loginAs, logout } from '../helpers/auth-helpers';
import { navigateTo } from '../helpers/navigation-helpers';

test.describe('Advanced Financial Reporting', () => {
  test('Custom report creation and export', async ({ page }) => {
    await loginAs(page, 'nazer');
    
    // 1. الانتقال إلى منشئ التقارير
    await navigateTo(page, '/report-builder');
    await expect(page).toHaveURL('/report-builder');
    
    // 2. إنشاء تقرير مخصص
    await page.click('button:has-text("تقرير جديد")');
    
    // اختيار نوع التقرير
    await page.fill('[name="report_name"]', 'تقرير المستفيدين - يناير 2025');
    await page.selectOption('[name="report_type"]', 'beneficiaries');
    await page.fill('[name="description"]', 'تقرير شامل للمستفيدين وتوزيعاتهم');
    
    // 3. إضافة فلاتر متقدمة
    await page.click('text=الفلاتر');
    
    // فلتر التاريخ
    await page.fill('[name="date_from"]', '2025-01-01');
    await page.fill('[name="date_to"]', '2025-01-31');
    
    // فلتر الفئة
    await page.click('[name="category_filter"]');
    await page.click('text=أسر منتجة');
    await page.click('text=أيتام');
    
    // فلتر القبيلة
    await page.selectOption('[name="tribe"]', 'قبيلة الاختبار');
    
    // فلتر الحالة
    await page.click('[name="status_filter"]');
    await page.click('text=نشط');
    
    // 4. اختيار الأعمدة
    await page.click('text=الأعمدة');
    await page.click('[name="column_name"]');
    await page.click('[name="column_national_id"]');
    await page.click('[name="column_category"]');
    await page.click('[name="column_total_received"]');
    await page.click('[name="column_last_payment"]');
    
    // 5. إضافة تجميع وإحصائيات
    await page.click('text=التجميع');
    await page.click('[name="group_by_category"]');
    await page.click('[name="show_totals"]');
    await page.click('[name="show_averages"]');
    
    // 6. حفظ التقرير
    await page.click('button:has-text("حفظ التقرير")');
    await expect(page.locator('text=تم حفظ التقرير')).toBeVisible();
    
    // 7. تشغيل التقرير وعرض النتائج
    await page.click('button:has-text("تشغيل التقرير")');
    await page.waitForLoadState('networkidle');
    
    // التحقق من عرض البيانات
    await expect(page.locator('[data-testid="report-table"]')).toBeVisible();
    const rowCount = await page.locator('[data-testid="report-row"]').count();
    expect(rowCount).toBeGreaterThan(0);
    
    // 8. عرض Charts تفاعلية
    await page.click('text=الرسوم البيانية');
    await expect(page.locator('[data-testid="chart-container"]')).toBeVisible();
    
    // عرض مخطط دائري للتوزيع حسب الفئة
    await page.click('button:has-text("مخطط دائري")');
    await expect(page.locator('[data-testid="pie-chart"]')).toBeVisible();
    
    // عرض مخطط عمودي للمدفوعات
    await page.click('button:has-text("مخطط عمودي")');
    await expect(page.locator('[data-testid="bar-chart"]')).toBeVisible();
    
    // 9. تصدير Excel
    await page.click('button:has-text("تصدير")');
    await page.click('text=Excel');
    await page.waitForTimeout(2000);
    
    // 10. تصدير PDF
    await page.click('button:has-text("تصدير")');
    await page.click('text=PDF');
    await page.waitForTimeout(2000);
    
    // 11. جدولة تقرير شهري
    await page.click('button:has-text("جدولة")');
    await page.selectOption('[name="frequency"]', 'monthly');
    await page.fill('[name="day_of_month"]', '1');
    await page.fill('[name="time"]', '08:00');
    await page.fill('[name="recipients"]', 'nazer@waqf.sa, admin@waqf.sa');
    await page.click('button:has-text("حفظ الجدولة")');
    await expect(page.locator('text=تم جدولة التقرير')).toBeVisible();
    
    await logout(page);
  });
  
  test('Financial dashboard with real-time data', async ({ page }) => {
    await loginAs(page, 'nazer');
    
    await navigateTo(page, '/nazer-dashboard');
    
    // التحقق من KPIs
    await expect(page.locator('[data-testid="total-revenue"]')).toBeVisible();
    await expect(page.locator('[data-testid="total-expenses"]')).toBeVisible();
    await expect(page.locator('[data-testid="beneficiaries-count"]')).toBeVisible();
    await expect(page.locator('[data-testid="pending-approvals"]')).toBeVisible();
    
    // التحقق من الرسوم البيانية
    await expect(page.locator('[data-testid="revenue-chart"]')).toBeVisible();
    await expect(page.locator('[data-testid="distribution-chart"]')).toBeVisible();
    await expect(page.locator('[data-testid="properties-performance"]')).toBeVisible();
    
    // تحديث بيانات Dashboard
    await page.click('button:has-text("تحديث")');
    await page.waitForLoadState('networkidle');
    
    await logout(page);
  });
  
  test('Comparative financial analysis', async ({ page }) => {
    await loginAs(page, 'accountant');
    
    await navigateTo(page, '/reports');
    await page.click('text=تحليل مقارن');
    
    // مقارنة بين فترتين
    await page.fill('[name="period1_from"]', '2024-01-01');
    await page.fill('[name="period1_to"]', '2024-12-31');
    await page.fill('[name="period2_from"]', '2025-01-01');
    await page.fill('[name="period2_to"]', '2025-12-31');
    
    await page.click('button:has-text("إنشاء التحليل")');
    
    // عرض المقارنة
    await expect(page.locator('[data-testid="comparison-table"]')).toBeVisible();
    await expect(page.locator('[data-testid="variance-percentage"]')).toBeVisible();
    await expect(page.locator('[data-testid="trend-chart"]')).toBeVisible();
    
    await logout(page);
  });
});
