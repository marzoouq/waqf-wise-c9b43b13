# 🛠️ E2E Helpers

## المساعدات المطلوبة

### auth-helpers.ts
```typescript
import { Page } from '@playwright/test';

export async function loginAs(page: Page, role: 'nazer' | 'accountant' | 'cashier' | 'archivist' | 'beneficiary' | 'admin') {
  const credentials = {
    nazer: { email: 'nazer@waqf.sa', password: 'test123' },
    accountant: { email: 'accountant@waqf.sa', password: 'test123' },
    cashier: { email: 'cashier@waqf.sa', password: 'test123' },
    archivist: { email: 'archivist@waqf.sa', password: 'test123' },
    beneficiary: { email: 'beneficiary@waqf.sa', password: 'test123' },
    admin: { email: 'admin@waqf.sa', password: 'test123' },
  };
  
  const { email, password } = credentials[role];
  await page.goto('/auth');
  await page.fill('[name="email"]', email);
  await page.fill('[name="password"]', password);
  await page.click('button[type="submit"]');
  await page.waitForURL(/\/(dashboard|nazer-dashboard|accountant-dashboard|cashier-dashboard|archivist-dashboard|beneficiary-dashboard)/);
}

export async function logout(page: Page) {
  await page.click('[data-testid="user-menu"]');
  await page.click('text=تسجيل الخروج');
  await page.waitForURL('/auth');
}
```

### navigation-helpers.ts
```typescript
export async function navigateTo(page: Page, route: string) {
  await page.goto(route);
  await page.waitForLoadState('networkidle');
}
```

### form-helpers.ts
```typescript
export async function fillForm(page: Page, data: Record<string, string>) {
  for (const [name, value] of Object.entries(data)) {
    await page.fill(`[name="${name}"]`, value);
  }
}
```
