# معمارية التطبيق

## 📋 نظرة عامة

نظام إدارة الوقف الإلكتروني مبني على React + TypeScript + Supabase مع تركيز على:
- **الأداء**: Lazy loading, code splitting, memoization
- **الأمان**: RLS policies, type-safe queries, error tracking
- **القابلية للصيانة**: Component-based architecture, unified error handling
- **تجربة المستخدم**: RTL support, responsive design, accessibility

## 🏗️ هيكل المشروع

```
src/
├── components/          # المكونات القابلة لإعادة الاستخدام
│   ├── accounting/     # مكونات المحاسبة
│   ├── beneficiaries/  # مكونات المستفيدين
│   ├── properties/     # مكونات العقارات
│   ├── shared/         # مكونات مشتركة
│   └── ui/            # مكونات UI من shadcn
├── hooks/             # Custom React Hooks
├── lib/               # أدوات ومساعدات
│   ├── errors/        # نظام معالجة الأخطاء
│   ├── logger/        # نظام logging
│   └── monitoring/    # Sentry & Web Vitals
├── pages/             # صفحات التطبيق (lazy loaded)
├── types/             # TypeScript type definitions
└── integrations/      # تكاملات خارجية (Supabase)
```

## 🎯 المبادئ المعمارية

### 1. Component-Based Architecture
كل feature له مجلد خاص يحتوي على:
- Components (UI)
- Hooks (Logic)
- Types (Type definitions)
- Utils (Helper functions)

```
src/components/beneficiaries/
├── BeneficiariesList.tsx
├── BeneficiaryCard.tsx
├── BeneficiaryForm.tsx
├── useBeneficiaries.ts
├── types.ts
└── utils.ts
```

### 2. Separation of Concerns

#### Presentation Layer (Components)
- مسؤولة فقط عن العرض البصري
- لا تحتوي على business logic معقدة
- تستقبل البيانات عبر props
- تستخدم hooks للتفاعل مع البيانات

#### Business Logic Layer (Hooks)
- Custom hooks تحتوي على كل المنطق
- تتعامل مع API calls
- تدير الحالة المحلية
- تعالج الأخطاء

#### Data Layer (Supabase)
- جميع البيانات في Supabase
- Type-safe queries باستخدام generated types
- RLS policies لحماية البيانات
- Edge Functions للمنطق المعقد

### 3. Error Handling Strategy

نظام موحد لمعالجة الأخطاء:

```typescript
// في المكونات
try {
  await mutation.mutateAsync(data);
  showSuccess('تمت العملية بنجاح');
} catch (error) {
  handleError(error, {
    context: { operation: 'create_beneficiary' },
    severity: 'high',
  });
}
```

معالج أخطاء موحد:
- استخراج رسالة مفهومة
- عرض toast مناسب
- تسجيل الخطأ (development) أو إرساله للسيرفر (production)
- إنشاء system alerts للأخطاء الحرجة

### 4. Performance Optimization

#### Code Splitting
جميع الصفحات lazy loaded:
```typescript
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Beneficiaries = lazy(() => import('./pages/Beneficiaries'));
```

#### Memoization
```typescript
const MemoizedComponent = React.memo(Component);
const memoizedValue = useMemo(() => expensiveComputation(), [deps]);
const memoizedCallback = useCallback(() => handler(), [deps]);
```

#### Virtual Scrolling
للقوائم الكبيرة نستخدم `@tanstack/react-virtual`:
```typescript
const rowVirtualizer = useVirtualizer({
  count: items.length,
  getScrollElement: () => parentRef.current,
  estimateSize: () => 80,
});
```

### 5. State Management

#### Server State (React Query)
لإدارة البيانات من السيرفر:
```typescript
const { data, isLoading, error } = useQuery({
  queryKey: ['beneficiaries'],
  queryFn: () => fetchBeneficiaries(),
});
```

#### Local State (React Hooks)
للحالة المحلية:
```typescript
const [selectedTab, setSelectedTab] = useState('overview');
const [filters, setFilters] = useState<Filters>(defaultFilters);
```

#### Form State (React Hook Form)
للنماذج:
```typescript
const form = useForm<FormData>({
  resolver: zodResolver(schema),
  defaultValues,
});
```

## 🔐 الأمان

### Row Level Security (RLS)
كل جدول محمي بـ RLS policies:
```sql
CREATE POLICY "Users can read their own data"
ON public.beneficiaries
FOR SELECT
USING (auth.uid() = user_id);
```

### Type Safety
استخدام TypeScript بشكل صارم:
- `strict: true`
- `noImplicitAny: true`
- Generated types من Supabase

### Input Validation
باستخدام Zod:
```typescript
const schema = z.object({
  full_name: z.string().min(3),
  national_id: z.string().length(10),
  email: z.string().email().optional(),
});
```

## 📊 Data Flow

```
User Action → Component → Hook → React Query → Supabase
                                      ↓
                              Error Handler
                                      ↓
                              Toast Notification
```

### مثال: إضافة مستفيد جديد

1. User يملأ النموذج في `BeneficiaryForm`
2. عند Submit، يتم validation باستخدام Zod
3. Hook `useBeneficiaries` يستدعي mutation
4. React Query يرسل البيانات لـ Supabase
5. Supabase يتحقق من RLS policies وينفذ العملية
6. عند النجاح: `showSuccess()` + invalidate queries
7. عند الفشل: `handleError()` + عرض toast

## 🎨 Design System

### Semantic Tokens
جميع الألوان من `index.css`:
```css
:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  --primary: 222.2 47.4% 11.2%;
  --primary-foreground: 210 40% 98%;
  /* ... */
}
```

### Components
نستخدم shadcn/ui components:
- قابلة للتخصيص
- accessible by default
- type-safe
- documented

## 🧪 الاختبارات

### Unit Tests (Vitest)
```typescript
describe('formatCurrency', () => {
  it('should format numbers correctly', () => {
    expect(formatCurrency(1000)).toBe('1,000 ريال');
  });
});
```

### Component Tests (Testing Library)
```typescript
it('should render beneficiary card', () => {
  render(<BeneficiaryCard beneficiary={mockData} />);
  expect(screen.getByText(mockData.full_name)).toBeInTheDocument();
});
```

### E2E Tests (Playwright)
```typescript
test('should create new beneficiary', async ({ page }) => {
  await page.goto('/beneficiaries');
  await page.click('text=إضافة مستفيد');
  await page.fill('#full_name', 'محمد أحمد');
  await page.click('button[type="submit"]');
  await expect(page.locator('text=تمت الإضافة بنجاح')).toBeVisible();
});
```

## 📈 Monitoring

### Error Tracking (Sentry)
تتبع الأخطاء في production:
```typescript
captureException(error, {
  extra: { userId, operation: 'payment' },
});
```

### Performance Monitoring (Web Vitals)
```typescript
onLCP((metric) => trackPerformance('LCP', metric.value));
onFID((metric) => trackPerformance('FID', metric.value));
onCLS((metric) => trackPerformance('CLS', metric.value));
```

## 🚀 Deployment

### Build Process
```bash
bun run build
```

يولد:
- Optimized production bundle
- Code splitting للصفحات
- Minified CSS/JS
- Source maps

### Performance Budget
- Initial bundle: < 200KB
- Total bundle: < 500KB
- Time to Interactive: < 3s
- First Contentful Paint: < 1.5s

## 📚 Best Practices

1. **Components**: صغيرة، focused، reusable
2. **Hooks**: منطق business logic منفصل
3. **Types**: استخدم TypeScript بشكل صارم
4. **Styles**: Tailwind semantic tokens فقط
5. **Errors**: استخدم نظام معالجة الأخطاء الموحد
6. **Tests**: اختبر الوظائف الحرجة
7. **Performance**: استخدم lazy loading و memoization
8. **Accessibility**: دعم keyboard navigation و ARIA
9. **Security**: RLS policies و input validation
10. **Documentation**: وثّق الكود المعقد

## 🔄 المساهمة

راجع [CONTRIBUTING.md](./CONTRIBUTING.md) للتفاصيل.

---

آخر تحديث: 2025
