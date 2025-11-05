# دليل Unit Tests - نظام إدارة الوقف

## إعداد بيئة الاختبار

### 1. تثبيت الحزم المطلوبة

```bash
npm install -D vitest @vitest/ui @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom
```

### 2. إنشاء ملف التكوين `vitest.config.ts`

```typescript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/mockData',
        'src/main.tsx',
      ],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
```

### 3. إنشاء ملف الإعداد `src/test/setup.ts`

```typescript
import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';

// Cleanup after each test
afterEach(() => {
  cleanup();
});

// Mock Supabase client
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(),
        })),
        order: vi.fn(),
        limit: vi.fn(),
      })),
      insert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn(),
        })),
      })),
      update: vi.fn(() => ({
        eq: vi.fn(() => ({
          select: vi.fn(() => ({
            single: vi.fn(),
          })),
        })),
      })),
      delete: vi.fn(() => ({
        eq: vi.fn(),
      })),
    })),
  },
}));

// Mock toast
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}));
```

### 4. تحديث `package.json`

```json
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage",
    "test:run": "vitest run"
  }
}
```

---

## أمثلة Unit Tests

### 1. اختبار Hooks - `src/hooks/__tests__/useFunds.test.ts`

```typescript
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, it, expect, beforeEach } from 'vitest';
import { useFunds } from '../useFunds';

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

describe('useFunds', () => {
  beforeEach(() => {
    // Reset mocks before each test
    vi.clearAllMocks();
  });

  it('should fetch funds successfully', async () => {
    const { result } = renderHook(() => useFunds(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.funds).toBeDefined();
    expect(Array.isArray(result.current.funds)).toBe(true);
  });

  it('should add a new fund', async () => {
    const { result } = renderHook(() => useFunds(), {
      wrapper: createWrapper(),
    });

    const newFund = {
      name: 'صندوق جديد',
      allocated_amount: 100000,
      spent_amount: 0,
      percentage: 10,
      beneficiaries_count: 0,
      category: 'عام',
      is_active: true,
    };

    await waitFor(() => {
      expect(result.current.addFund).toBeDefined();
    });

    // Test would call addFund here
  });
});
```

### 2. اختبار Components - `src/components/shared/__tests__/LoadingState.test.tsx`

```typescript
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { LoadingState } from '../LoadingState';

describe('LoadingState', () => {
  it('renders with default message', () => {
    render(<LoadingState />);
    expect(screen.getByText('جاري التحميل...')).toBeInTheDocument();
  });

  it('renders with custom message', () => {
    render(<LoadingState message="جاري تحميل البيانات" />);
    expect(screen.getByText('جاري تحميل البيانات')).toBeInTheDocument();
  });

  it('renders in fullscreen mode', () => {
    const { container } = render(<LoadingState fullScreen />);
    expect(container.firstChild).toHaveClass('min-h-screen');
  });

  it('renders with different sizes', () => {
    const { rerender } = render(<LoadingState size="sm" />);
    expect(screen.getByRole('status')).toHaveClass('h-4 w-4');

    rerender(<LoadingState size="lg" />);
    expect(screen.getByRole('status')).toHaveClass('h-12 w-12');
  });
});
```

### 3. اختبار EmptyState - `src/components/shared/__tests__/EmptyState.test.tsx`

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { EmptyState } from '../EmptyState';
import { FileText } from 'lucide-react';

describe('EmptyState', () => {
  it('renders with required props', () => {
    render(
      <EmptyState
        icon={FileText}
        title="لا توجد بيانات"
        description="ابدأ بإضافة بيانات جديدة"
      />
    );

    expect(screen.getByText('لا توجد بيانات')).toBeInTheDocument();
    expect(screen.getByText('ابدأ بإضافة بيانات جديدة')).toBeInTheDocument();
  });

  it('calls onAction when action button is clicked', () => {
    const handleAction = vi.fn();
    render(
      <EmptyState
        icon={FileText}
        title="لا توجد بيانات"
        description="ابدأ بإضافة بيانات جديدة"
        actionLabel="إضافة"
        onAction={handleAction}
      />
    );

    const button = screen.getByText('إضافة');
    fireEvent.click(button);
    expect(handleAction).toHaveBeenCalledTimes(1);
  });

  it('does not render action button when not provided', () => {
    render(
      <EmptyState
        icon={FileText}
        title="لا توجد بيانات"
        description="ابدأ بإضافة بيانات جديدة"
      />
    );

    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
});
```

### 4. اختبار Utilities - `src/lib/__tests__/filters.test.ts`

```typescript
import { describe, it, expect } from 'vitest';
import { filterByStatus, filterByDateRange, searchByName } from '../filters';

describe('filters utility', () => {
  const testData = [
    { id: 1, name: 'أحمد', status: 'نشط', date: '2024-01-15' },
    { id: 2, name: 'محمد', status: 'غير نشط', date: '2024-02-20' },
    { id: 3, name: 'فاطمة', status: 'نشط', date: '2024-03-10' },
  ];

  describe('filterByStatus', () => {
    it('filters by active status', () => {
      const result = filterByStatus(testData, 'نشط');
      expect(result).toHaveLength(2);
      expect(result[0].status).toBe('نشط');
    });

    it('returns all items when status is "all"', () => {
      const result = filterByStatus(testData, 'all');
      expect(result).toHaveLength(3);
    });
  });

  describe('searchByName', () => {
    it('searches by name', () => {
      const result = searchByName(testData, 'أحمد');
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('أحمد');
    });

    it('returns all items when query is empty', () => {
      const result = searchByName(testData, '');
      expect(result).toHaveLength(3);
    });
  });
});
```

### 5. اختبار Integration - `src/pages/__tests__/Archive.test.tsx`

```typescript
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect, vi } from 'vitest';
import Archive from '../Archive';

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  
  return ({ children }: { children: React.ReactNode }) => (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </BrowserRouter>
  );
};

describe('Archive Page', () => {
  it('renders archive page title', async () => {
    render(<Archive />, { wrapper: createWrapper() });
    
    await waitFor(() => {
      expect(screen.getByText('الأرشيف الإلكتروني')).toBeInTheDocument();
    });
  });

  it('displays loading state initially', () => {
    render(<Archive />, { wrapper: createWrapper() });
    expect(screen.getByText(/جاري تحميل/i)).toBeInTheDocument();
  });

  it('renders upload document button', async () => {
    render(<Archive />, { wrapper: createWrapper() });
    
    await waitFor(() => {
      expect(screen.getByText('رفع مستند')).toBeInTheDocument();
    });
  });
});
```

---

## تشغيل الاختبارات

```bash
# تشغيل جميع الاختبارات
npm test

# تشغيل مع واجهة مستخدم
npm run test:ui

# تشغيل مع تقرير التغطية
npm run test:coverage

# تشغيل مرة واحدة (للـ CI/CD)
npm run test:run
```

---

## معايير الجودة المطلوبة

- **Test Coverage**: هدف 70%+ على الأقل
- **Unit Tests**: لكل hook و utility function
- **Component Tests**: للمكونات المشتركة (LoadingState, EmptyState, ErrorBoundary)
- **Integration Tests**: لأهم 3 صفحات (Dashboard, Archive, Funds)
- **Edge Cases**: اختبار الحالات الاستثنائية والأخطاء

---

## الخطوات القادمة

1. تثبيت الحزم المطلوبة
2. إنشاء ملفات التكوين
3. كتابة Tests للـ Hooks (5 files)
4. كتابة Tests للـ Components (3 files)
5. كتابة Tests للـ Utilities (3 files)
6. كتابة Integration Tests (3 files)
7. تشغيل وفحص التغطية

**المدة المتوقعة للتنفيذ الكامل:** 2-3 ساعات
