import { test, expect } from '@playwright/test';
import { loginAs, logout } from '../helpers/auth-helpers';
import { navigateTo } from '../helpers/navigation-helpers';

test.describe('AI Chatbot Interactions', () => {
  test('Complete chatbot workflow', async ({ page }) => {
    await loginAs(page, 'nazer');
    
    // 1. فتح المساعد الذكي
    await navigateTo(page, '/chatbot');
    await expect(page).toHaveURL('/chatbot');
    
    // التحقق من ظهور الواجهة
    await expect(page.locator('[data-testid="chatbot-interface"]')).toBeVisible();
    await expect(page.locator('[data-testid="welcome-message"]')).toBeVisible();
    
    // 2. طرح سؤال عن المستفيدين
    await page.fill('[data-testid="chat-input"]', 'كم عدد المستفيدين النشطين؟');
    await page.click('[data-testid="send-button"]');
    
    // انتظار الرد
    await expect(page.locator('[data-testid="ai-response"]').last()).toBeVisible();
    await expect(page.locator('[data-testid="ai-response"]').last()).toContainText(/\d+/);
    
    // 3. الحصول على إحصائيات فورية
    await page.fill('[data-testid="chat-input"]', 'ما هو إجمالي التوزيعات هذا الشهر؟');
    await page.click('[data-testid="send-button"]');
    
    await expect(page.locator('[data-testid="ai-response"]').last()).toBeVisible();
    await expect(page.locator('[data-testid="statistics-card"]')).toBeVisible();
    
    // 4. طلب إنشاء تقرير
    await page.fill('[data-testid="chat-input"]', 'أنشئ لي تقرير بالمستفيدين من فئة أسر منتجة');
    await page.click('[data-testid="send-button"]');
    
    await expect(page.locator('[data-testid="ai-response"]').last()).toBeVisible();
    await expect(page.locator('[data-testid="report-preview"]')).toBeVisible();
    await expect(page.locator('button:has-text("عرض التقرير الكامل")')).toBeVisible();
    
    // 5. استخدام Quick Actions
    await expect(page.locator('[data-testid="quick-actions"]')).toBeVisible();
    
    // النقر على إجراء سريع
    await page.click('[data-testid="quick-action"]:has-text("المستفيدون")');
    await expect(page.locator('[data-testid="ai-response"]').last()).toBeVisible();
    
    await page.click('[data-testid="quick-action"]:has-text("التوزيعات")');
    await expect(page.locator('[data-testid="ai-response"]').last()).toBeVisible();
    
    await page.click('[data-testid="quick-action"]:has-text("التقارير")');
    await expect(page.locator('[data-testid="ai-response"]').last()).toBeVisible();
    
    // 6. الانتقال للقسم المطلوب من الشات
    await page.fill('[data-testid="chat-input"]', 'اذهب إلى صفحة المستفيدين');
    await page.click('[data-testid="send-button"]');
    
    await expect(page.locator('[data-testid="ai-response"]').last()).toContainText('المستفيدين');
    await expect(page.locator('button:has-text("الذهاب")')).toBeVisible();
    
    await page.click('button:has-text("الذهاب")');
    await expect(page).toHaveURL('/beneficiaries');
    
    await logout(page);
  });
  
  test('Chatbot with contextual follow-up', async ({ page }) => {
    await loginAs(page, 'accountant');
    
    await navigateTo(page, '/chatbot');
    
    // سلسلة من الأسئلة المترابطة
    await page.fill('[data-testid="chat-input"]', 'ما هو رصيد الحساب البنكي الرئيسي؟');
    await page.click('[data-testid="send-button"]');
    await expect(page.locator('[data-testid="ai-response"]').last()).toBeVisible();
    
    // سؤال متابعة بدون تكرار السياق
    await page.fill('[data-testid="chat-input"]', 'وكم كان الرصيد الشهر الماضي؟');
    await page.click('[data-testid="send-button"]');
    await expect(page.locator('[data-testid="ai-response"]').last()).toBeVisible();
    
    // سؤال متابعة آخر
    await page.fill('[data-testid="chat-input"]', 'ما الفرق بينهما؟');
    await page.click('[data-testid="send-button"]');
    await expect(page.locator('[data-testid="ai-response"]').last()).toBeVisible();
    await expect(page.locator('[data-testid="comparison-data"]')).toBeVisible();
    
    await logout(page);
  });
  
  test('Chatbot error handling', async ({ page }) => {
    await loginAs(page, 'beneficiary');
    
    await navigateTo(page, '/chatbot');
    
    // سؤال غير واضح
    await page.fill('[data-testid="chat-input"]', 'كيف الحال؟');
    await page.click('[data-testid="send-button"]');
    
    await expect(page.locator('[data-testid="ai-response"]').last()).toContainText(/أستطيع مساعدتك|يمكنني/);
    
    // طلب غير مصرح به
    await page.fill('[data-testid="chat-input"]', 'أعطني قائمة بجميع المستخدمين');
    await page.click('[data-testid="send-button"]');
    
    await expect(page.locator('[data-testid="ai-response"]').last()).toContainText(/غير مصرح|لا يمكن/);
    
    await logout(page);
  });
});
