# دليل الاختبار - Waqf Wise Testing Guide

## 📋 نظرة عامة

هذا الدليل الشامل لاختبار منصة **Waqf Wise**، يغطي جميع أنواع الاختبارات المستخدمة وكيفية كتابتها وتشغيلها.

---

## 🎯 استراتيجية الاختبار

### هرم الاختبار (Testing Pyramid)

```
        /\
       /  \      E2E Tests (قليلة)
      /____\     
     /      \    Integration Tests (متوسطة)
    /        \   
   /__________\  Unit Tests (كثيرة)
```

### أنواع الاختبارات:

1. **Unit Tests** (70%): اختبار المكونات والدوال المستقلة
2. **Integration Tests** (20%): اختبار تكامل المكونات مع بعضها
3. **E2E Tests** (10%): اختبار سيناريوهات المستخدم الكاملة

---

## 🧪 التقنيات المستخدمة

### 1. **Vitest**
- اختبارات Unit و Integration
- سريع جداً (مبني على Vite)
- API متوافق مع Jest

### 2. **Testing Library**
- `@testing-library/react` - اختبار مكونات React
- `@testing-library/user-event` - محاكاة تفاعل المستخدم
- `@testing-library/jest-dom` - Matchers إضافية

### 3. **Playwright**
- اختبارات E2E
- دعم متعدد المتصفحات
- سريع وموثوق

---

## 🚀 تشغيل الاختبارات

### الأوامر الأساسية:

```bash
# تشغيل جميع الاختبارات
npm run test

# تشغيل الاختبارات في وضع المراقبة (watch mode)
npm run test:watch

# تشغيل اختبارات E2E
npm run test:e2e

# تشغيل اختبارات E2E في وضع UI
npm run test:e2e:ui

# توليد تقرير التغطية (coverage)
npm run test:coverage

# فتح واجهة Vitest
npm run test:ui
```

### تشغيل اختبارات معينة:

```bash
# تشغيل ملف اختبار محدد
npm run test -- beneficiary.test.tsx

# تشغيل اختبارات تحتوي على نص معين
npm run test -- -t "should render beneficiary"

# تشغيل اختبارات مجلد محدد
npm run test -- src/components/beneficiary
```

---

## 📝 كتابة Unit Tests

### بنية الاختبار:

```typescript
// src/components/beneficiary/__tests__/BeneficiaryCard.test.tsx

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { BeneficiaryCard } from "../BeneficiaryCard";

describe("BeneficiaryCard", () => {
  // إعداد قبل كل اختبار
  beforeEach(() => {
    // تنظيف أو إعداد مشترك
  });

  it("should render beneficiary name", () => {
    const mockBeneficiary = {
      id: "123",
      full_name: "أحمد محمد",
      status: "active",
      total_received: 5000,
    };

    render(<BeneficiaryCard beneficiary={mockBeneficiary} />);
    
    expect(screen.getByText("أحمد محمد")).toBeInTheDocument();
  });

  it("should display correct status badge", () => {
    const mockBeneficiary = {
      id: "123",
      full_name: "أحمد محمد",
      status: "active",
      total_received: 5000,
    };

    render(<BeneficiaryCard beneficiary={mockBeneficiary} />);
    
    const badge = screen.getByText("active");
    expect(badge).toHaveClass("variant-default");
  });

  it("should call onView when button clicked", () => {
    const onView = vi.fn();
    const mockBeneficiary = {
      id: "123",
      full_name: "أحمد محمد",
      status: "active",
      total_received: 5000,
    };

    render(<BeneficiaryCard beneficiary={mockBeneficiary} onView={onView} />);
    
    const button = screen.getByRole("button", { name: /عرض التفاصيل/i });
    fireEvent.click(button);
    
    expect(onView).toHaveBeenCalledWith("123");
  });
});
```

### اختبار المكونات مع Hooks:

```typescript
// src/hooks/__tests__/useBeneficiaries.test.ts

import { describe, it, expect, vi } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useBeneficiaries } from "../useBeneficiaries";

// إنشاء wrapper للـ hook
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

describe("useBeneficiaries", () => {
  it("should fetch beneficiaries successfully", async () => {
    const { result } = renderHook(() => useBeneficiaries(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toBeDefined();
    expect(Array.isArray(result.current.data)).toBe(true);
  });

  it("should handle errors", async () => {
    // Mock خطأ في Supabase
    vi.mock("@/integrations/supabase/client", () => ({
      supabase: {
        from: () => ({
          select: () => ({
            order: () => ({
              error: new Error("Database error"),
              data: null,
            }),
          }),
        }),
      },
    }));

    const { result } = renderHook(() => useBeneficiaries(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.error).toBeDefined();
  });
});
```

---

## 🔗 كتابة Integration Tests

### اختبار تكامل مكونات متعددة:

```typescript
// src/pages/__tests__/BeneficiaryDetails.test.tsx

import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import BeneficiaryDetails from "../BeneficiaryDetails";

describe("BeneficiaryDetails Integration", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    });
  });

  it("should load and display beneficiary details", async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={["/beneficiaries/123"]}>
          <Routes>
            <Route path="/beneficiaries/:id" element={<BeneficiaryDetails />} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    );

    // انتظار تحميل البيانات
    await waitFor(() => {
      expect(screen.queryByText(/جاري التحميل/i)).not.toBeInTheDocument();
    });

    // التحقق من عرض البيانات
    expect(screen.getByText(/أحمد محمد/i)).toBeInTheDocument();
    expect(screen.getByText(/معلومات المستفيد/i)).toBeInTheDocument();
  });

  it("should display error message on fetch failure", async () => {
    // Mock خطأ في الجلب
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={["/beneficiaries/invalid"]}>
          <Routes>
            <Route path="/beneficiaries/:id" element={<BeneficiaryDetails />} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(screen.getByText(/حدث خطأ/i)).toBeInTheDocument();
    });
  });
});
```

### اختبار تكامل مع Supabase:

```typescript
// src/hooks/__tests__/useBeneficiaryMutations.test.ts

import { describe, it, expect, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useAddBeneficiary, useUpdateBeneficiary } from "../useBeneficiaries";
import { createWrapper } from "./test-utils";

describe("Beneficiary Mutations Integration", () => {
  it("should add beneficiary and update cache", async () => {
    const { result } = renderHook(
      () => ({
        add: useAddBeneficiary(),
        list: useBeneficiaries(),
      }),
      { wrapper: createWrapper() }
    );

    // تأكد من تحميل القائمة الأولية
    await waitFor(() => expect(result.current.list.isSuccess).toBe(true));
    const initialCount = result.current.list.data?.length || 0;

    // إضافة مستفيد جديد
    result.current.add.mutate({
      full_name: "مستفيد جديد",
      national_id: "1234567890",
      phone: "0512345678",
      category: "أبناء",
      status: "active",
    });

    // انتظار نجاح الإضافة
    await waitFor(() => expect(result.current.add.isSuccess).toBe(true));

    // التحقق من تحديث الكاش
    expect(result.current.list.data?.length).toBe(initialCount + 1);
  });
});
```

---

## 🌐 كتابة E2E Tests (Playwright)

### بنية اختبار E2E:

```typescript
// tests/e2e/beneficiary-flow.spec.ts

import { test, expect } from "@playwright/test";

test.describe("Beneficiary Management Flow", () => {
  test.beforeEach(async ({ page }) => {
    // تسجيل الدخول
    await page.goto("/login");
    await page.fill('input[name="email"]', "admin@example.com");
    await page.fill('input[name="password"]', "password");
    await page.click('button[type="submit"]');
    await page.waitForURL("/dashboard");
  });

  test("should add new beneficiary", async ({ page }) => {
    // الانتقال لصفحة المستفيدين
    await page.goto("/beneficiaries");
    await expect(page.getByText("قائمة المستفيدين")).toBeVisible();

    // فتح نموذج إضافة مستفيد
    await page.click('button:has-text("إضافة مستفيد")');
    await expect(page.getByText("إضافة مستفيد جديد")).toBeVisible();

    // ملء النموذج
    await page.fill('input[name="full_name"]', "أحمد محمد السعودي");
    await page.fill('input[name="national_id"]', "1234567890");
    await page.fill('input[name="phone"]', "0512345678");
    await page.selectOption('select[name="category"]', "أبناء");

    // حفظ
    await page.click('button[type="submit"]');

    // التحقق من رسالة النجاح
    await expect(page.getByText("تمت إضافة المستفيد بنجاح")).toBeVisible();

    // التحقق من ظهور المستفيد في القائمة
    await expect(page.getByText("أحمد محمد السعودي")).toBeVisible();
  });

  test("should edit beneficiary information", async ({ page }) => {
    await page.goto("/beneficiaries");

    // فتح أول مستفيد
    await page.click(".beneficiary-card:first-child >> button:has-text('عرض')");

    // الانتقال لوضع التعديل
    await page.click('button:has-text("تعديل")');

    // تعديل الاسم
    await page.fill('input[name="full_name"]', "أحمد محمد - معدل");

    // حفظ التعديلات
    await page.click('button:has-text("حفظ")');

    // التحقق من رسالة النجاح
    await expect(page.getByText("تم تحديث البيانات بنجاح")).toBeVisible();
  });

  test("should filter beneficiaries", async ({ page }) => {
    await page.goto("/beneficiaries");

    // فتح قائمة الفلاتر
    await page.click('button:has-text("تصفية")');

    // اختيار حالة نشط فقط
    await page.check('input[value="active"]');

    // تطبيق الفلتر
    await page.click('button:has-text("تطبيق")');

    // التحقق من النتائج
    const cards = await page.locator(".beneficiary-card").count();
    expect(cards).toBeGreaterThan(0);

    // التحقق من أن جميع النتائج نشطة
    const statuses = await page.locator(".beneficiary-card >> .status-badge").allTextContents();
    statuses.forEach((status) => {
      expect(status.toLowerCase()).toContain("active");
    });
  });
});
```

### اختبار سيناريو التوزيع الكامل:

```typescript
// tests/e2e/distribution-flow.spec.ts

import { test, expect } from "@playwright/test";

test.describe("Distribution Creation Flow", () => {
  test("should create and approve distribution", async ({ page }) => {
    // تسجيل الدخول كناظر
    await page.goto("/login");
    await page.fill('input[name="email"]', "nazer@example.com");
    await page.fill('input[name="password"]', "password");
    await page.click('button[type="submit"]');

    // الانتقال لصفحة التوزيعات
    await page.goto("/distributions");

    // إنشاء توزيع جديد
    await page.click('button:has-text("توزيع جديد")');

    // اختيار الصندوق
    await page.selectOption('select[name="fund_id"]', { index: 1 });

    // إدخال المبلغ
    await page.fill('input[name="amount"]', "100000");

    // محاكاة التوزيع
    await page.click('button:has-text("محاكاة")');

    // انتظار نتائج المحاكاة
    await expect(page.getByText("نتائج المحاكاة")).toBeVisible();

    // التحقق من التفاصيل
    await expect(page.getByText(/عدد المستفيدين:/)).toBeVisible();

    // إنشاء التوزيع
    await page.click('button:has-text("إنشاء التوزيع")');

    // التحقق من رسالة النجاح
    await expect(page.getByText("تم إنشاء التوزيع بنجاح")).toBeVisible();

    // الموافقة على التوزيع
    await page.click('button:has-text("الموافقة")');

    // إدخال ملاحظات الموافقة
    await page.fill('textarea[name="notes"]', "تمت الموافقة");
    await page.click('button:has-text("تأكيد الموافقة")');

    // التحقق من تغيير الحالة
    await expect(page.getByText("معتمد")).toBeVisible();
  });
});
```

---

## 🎭 Mocking في الاختبارات

### Mock Supabase Client:

```typescript
// src/test/mocks/supabase.ts

import { vi } from "vitest";

export const createMockSupabaseClient = () => ({
  from: vi.fn().mockReturnValue({
    select: vi.fn().mockReturnValue({
      eq: vi.fn().mockReturnValue({
        single: vi.fn().mockResolvedValue({
          data: {
            id: "123",
            full_name: "أحمد محمد",
            status: "active",
          },
          error: null,
        }),
      }),
      order: vi.fn().mockResolvedValue({
        data: [
          {
            id: "123",
            full_name: "أحمد محمد",
            status: "active",
          },
        ],
        error: null,
      }),
    }),
    insert: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        single: vi.fn().mockResolvedValue({
          data: { id: "new-id" },
          error: null,
        }),
      }),
    }),
    update: vi.fn().mockReturnValue({
      eq: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: { id: "123", updated: true },
            error: null,
          }),
        }),
      }),
    }),
  }),
  auth: {
    getSession: vi.fn().mockResolvedValue({
      data: {
        session: {
          user: {
            id: "user-123",
            email: "test@example.com",
          },
        },
      },
      error: null,
    }),
  },
});

// استخدام
vi.mock("@/integrations/supabase/client", () => ({
  supabase: createMockSupabaseClient(),
}));
```

### Mock React Query:

```typescript
// src/test/utils/query-client.ts

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode } from "react";

export const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        cacheTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
  });

export const createQueryWrapper = () => {
  const testQueryClient = createTestQueryClient();
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={testQueryClient}>
      {children}
    </QueryClientProvider>
  );
};
```

---

## 📊 تقرير التغطية (Coverage)

### توليد تقرير التغطية:

```bash
npm run test:coverage
```

### قراءة التقرير:

```
---------------------------|---------|----------|---------|---------|
File                       | % Stmts | % Branch | % Funcs | % Lines |
---------------------------|---------|----------|---------|---------|
All files                  |   85.23 |    78.45 |   82.10 |   85.67 |
 src/components            |   90.15 |    85.20 |   88.50 |   90.30 |
  BeneficiaryCard.tsx      |   95.00 |    90.00 |   92.50 |   95.50 |
  PropertyCard.tsx         |   88.00 |    82.00 |   85.00 |   88.50 |
 src/hooks                 |   82.50 |    75.30 |   80.00 |   83.00 |
  useBeneficiaries.ts      |   85.00 |    78.00 |   82.00 |   86.00 |
---------------------------|---------|----------|---------|---------|
```

### معايير التغطية المطلوبة:

- **Statements**: 80% أو أكثر
- **Branches**: 75% أو أكثر
- **Functions**: 80% أو أكثر
- **Lines**: 80% أو أكثر

---

## ✅ أفضل الممارسات

### 1. **تسمية الاختبارات**
```typescript
// ✅ جيد - واضح ومحدد
it("should display error message when API fails", () => {});

// ❌ سيء - غير واضح
it("test error", () => {});
```

### 2. **ترتيب الاختبارات (AAA Pattern)**
```typescript
it("should update beneficiary", async () => {
  // Arrange (الإعداد)
  const beneficiary = { id: "123", name: "أحمد" };
  const updates = { name: "محمد" };

  // Act (التنفيذ)
  const result = await updateBeneficiary(beneficiary.id, updates);

  // Assert (التحقق)
  expect(result.name).toBe("محمد");
});
```

### 3. **اختبار الحالات الحدية**
```typescript
describe("BeneficiaryForm", () => {
  it("should handle empty form submission", () => {});
  it("should handle invalid national ID", () => {});
  it("should handle special characters in name", () => {});
  it("should handle extremely long text", () => {});
});
```

### 4. **استخدام Data-testid بحذر**
```typescript
// ✅ جيد - استخدام الدور والنص
const button = screen.getByRole("button", { name: /حفظ/i });

// ❌ تجنب - الاعتماد الكلي على data-testid
const button = screen.getByTestId("save-button");
```

### 5. **تنظيف بعد الاختبار**
```typescript
import { afterEach } from "vitest";

afterEach(() => {
  vi.clearAllMocks();
  // تنظيف أي resources
});
```

---

## 🚫 الأخطاء الشائعة

### 1. **عدم انتظار العمليات غير المتزامنة**
```typescript
// ❌ خطأ
it("should load data", () => {
  render(<MyComponent />);
  expect(screen.getByText("البيانات")).toBeInTheDocument();
});

// ✅ صحيح
it("should load data", async () => {
  render(<MyComponent />);
  await waitFor(() => {
    expect(screen.getByText("البيانات")).toBeInTheDocument();
  });
});
```

### 2. **اختبار التفاصيل الداخلية**
```typescript
// ❌ خطأ - اختبار state الداخلي
it("should update state", () => {
  const { result } = renderHook(() => useState(0));
  expect(result.current[0]).toBe(0);
});

// ✅ صحيح - اختبار السلوك المرئي
it("should display count", () => {
  render(<Counter />);
  expect(screen.getByText("العدد: 0")).toBeInTheDocument();
});
```

### 3. **اختبارات معتمدة على بعضها**
```typescript
// ❌ خطأ - اختبارات مترابطة
let sharedData;
it("test 1", () => {
  sharedData = { value: 1 };
});
it("test 2", () => {
  expect(sharedData.value).toBe(1);
});

// ✅ صحيح - اختبارات مستقلة
it("test 1", () => {
  const data = { value: 1 };
  expect(data.value).toBe(1);
});
it("test 2", () => {
  const data = { value: 1 };
  expect(data.value).toBe(1);
});
```

---

## 📚 موارد إضافية

### التوثيق الرسمي:
- [Vitest Documentation](https://vitest.dev/)
- [Testing Library](https://testing-library.com/react)
- [Playwright](https://playwright.dev/)

### التوثيق الداخلي:
- [دليل المطور](./DEVELOPER_GUIDE.md)
- [البنية المعمارية](./ARCHITECTURE.md)

---

## 🔄 التحديثات المستمرة

### إضافة اختبار جديد:
1. حدد نوع الاختبار (Unit/Integration/E2E)
2. اكتب الاختبار في المكان المناسب
3. تأكد من مرور جميع الاختبارات
4. تحقق من التغطية
5. وثّق أي سلوك خاص

### صيانة الاختبارات:
- راجع الاختبارات عند تغيير الكود
- حدّث Mock data عند تغيير الـ schema
- حذف الاختبارات القديمة غير المستخدمة

---

**آخر تحديث**: 2025
**الإصدار**: 1.0.0
