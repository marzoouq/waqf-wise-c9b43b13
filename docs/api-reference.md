# مرجع API - منصة إدارة الوقف الإلكترونية

## التاريخ: 2025-11-29

---

## 1. Hooks المتاحة

### 1.1 Hooks الأداء

| Hook | الملف | الوصف |
|------|-------|-------|
| `useQueryPrefetch` | `/hooks/useQueryPrefetch.ts` | تحميل مسبق للبيانات |
| `useAutoPrefetch` | `/hooks/useQueryPrefetch.ts` | تحميل تلقائي حسب الصفحة |
| `useImageOptimization` | `/hooks/useImageOptimization.ts` | مراقبة LCP |
| `useImagePreload` | `/hooks/useImageOptimization.ts` | تحميل مسبق للصور |
| `useRenderTracking` | `/lib/performance.ts` | تتبع renders |

### 1.2 Hooks المصادقة

| Hook | الملف | الوصف |
|------|-------|-------|
| `useAuth` | `/hooks/useAuth.ts` | حالة المصادقة |
| `useUserRole` | `/hooks/useUserRole.ts` | دور المستخدم الحالي |
| `usePermissions` | `/hooks/usePermissions.ts` | صلاحيات المستخدم |

### 1.3 Hooks البيانات

| Hook | الملف | الوصف |
|------|-------|-------|
| `useBeneficiaries` | `/hooks/useBeneficiaries.ts` | إدارة المستفيدين |
| `useProperties` | `/hooks/useProperties.ts` | إدارة العقارات |
| `useFunds` | `/hooks/useFunds.ts` | إدارة الصناديق |
| `useDocuments` | `/hooks/useDocuments.ts` | إدارة المستندات |
| `useDocumentUpload` | `/hooks/useDocumentUpload.ts` | رفع الملفات |

---

## 2. مكونات الأداء

### 2.1 LCPOptimizer
```tsx
import { LCPOptimizer } from '@/components/performance/LCPOptimizer';

// يُستخدم في App.tsx - لا يحتاج props
<LCPOptimizer />
```

**الوظائف:**
- تحميل مسبق للخطوط
- تحسين أولوية الموارد
- تأجيل الموارد غير الحرجة
- مراقبة LCP

### 2.2 CriticalResourceLoader
```tsx
import { CriticalResourceLoader } from '@/components/performance/CriticalResourceLoader';

// يُستخدم داخل BrowserRouter
<BrowserRouter>
  <CriticalResourceLoader />
  {/* ... */}
</BrowserRouter>
```

**الوظائف:**
- تحميل مسبق للصفحات المرتبطة
- تحميل مسبق للصور الحرجة
- تأجيل iframes والصور

---

## 3. Skeleton Components

### 3.1 KPISkeleton
```tsx
import { KPISkeleton } from '@/components/dashboard/KPISkeleton';

<KPISkeleton count={8} />
```

### 3.2 ChartSkeleton
```tsx
import { ChartSkeleton } from '@/components/dashboard/ChartSkeleton';

<ChartSkeleton 
  title="optional"
  height="h-[350px]"
  showLegend={true}
/>
```

### 3.3 SectionSkeleton
```tsx
import { SectionSkeleton } from '@/components/dashboard/SectionSkeleton';

<SectionSkeleton />
```

### 3.4 LoadingState Variants
```tsx
import { 
  LoadingState,
  TableLoadingSkeleton,
  StatsLoadingSkeleton,
  DashboardLoadingSkeleton,
  BeneficiariesLoadingSkeleton,
  AccountingLoadingSkeleton
} from '@/components/shared/LoadingState';

// عام
<LoadingState message="جاري التحميل..." size="lg" fullScreen />

// جدول
<TableLoadingSkeleton rows={5} />

// لوحة تحكم
<DashboardLoadingSkeleton />
```

---

## 4. استخدام Query Prefetch

### 4.1 التحميل اليدوي
```tsx
import { useQueryPrefetch } from '@/hooks/useQueryPrefetch';

function MyComponent() {
  const { prefetchQuery, prefetchMultiple } = useQueryPrefetch();
  
  // تحميل نوع واحد
  prefetchQuery('beneficiaries');
  
  // تحميل عدة أنواع
  prefetchMultiple(['beneficiaries', 'properties', 'funds']);
}
```

### 4.2 التحميل التلقائي
```tsx
import { useAutoPrefetch } from '@/hooks/useQueryPrefetch';
import { useLocation } from 'react-router-dom';

function MyComponent() {
  const location = useLocation();
  
  // يُحمّل تلقائياً البيانات المرتبطة بالصفحة الحالية
  useAutoPrefetch(location.pathname);
}
```

### 4.3 أنواع البيانات المدعومة
- `beneficiaries` - المستفيدين
- `properties` - العقارات
- `funds` - الصناديق
- `documents` - المستندات
- `journal_entries` - القيود المحاسبية
- `payment_vouchers` - سندات الصرف

---

## 5. LazyImage Component

```tsx
import { LazyImage, HeroImage, ThumbnailImage } from '@/components/shared/LazyImage';

// صورة عادية
<LazyImage 
  src="/path/to/image.jpg"
  alt="وصف الصورة"
  priority={false}
  responsive={true}
  quality={80}
/>

// صورة Hero (أولوية عالية)
<HeroImage
  src="/hero.jpg"
  alt="صورة رئيسية"
  className="w-full h-[400px]"
/>

// صورة مصغرة
<ThumbnailImage
  src="/thumb.jpg"
  alt="صورة مصغرة"
/>
```

---

## 6. Error Boundaries

### 6.1 GlobalErrorBoundary
```tsx
import { GlobalErrorBoundary } from '@/components/shared/GlobalErrorBoundary';

<GlobalErrorBoundary>
  <App />
</GlobalErrorBoundary>
```

### 6.2 LazyErrorBoundary
```tsx
import { LazyErrorBoundary } from '@/components/shared/LazyErrorBoundary';

<LazyErrorBoundary>
  <Suspense fallback={<LoadingState />}>
    <LazyComponent />
  </Suspense>
</LazyErrorBoundary>
```

---

## 7. Query Client Configuration

```tsx
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,    // 5 دقائق
      gcTime: 10 * 60 * 1000,      // 10 دقائق
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
      refetchOnMount: false,
      structuralSharing: true,
      networkMode: 'online',
      retry: (failureCount, error) => {
        // لا تعيد المحاولة على 404/403
        if (error.status === 404 || error.status === 403) return false;
        return failureCount < 3;
      },
      retryDelay: (attemptIndex) => {
        return Math.min(1000 * 2 ** attemptIndex, 4000);
      },
    },
  },
});
```

---

## 8. أفضل الممارسات

### 8.1 استخدام Suspense
```tsx
// ✅ صحيح
<Suspense fallback={<KPISkeleton count={4} />}>
  <DashboardKPIs />
</Suspense>

// ❌ خاطئ
<DashboardKPIs />
```

### 8.2 تحميل الصور
```tsx
// ✅ صحيح - صورة ذات أولوية عالية
<img 
  src="/hero.jpg" 
  alt="Hero" 
  fetchpriority="high"
  data-priority="high"
/>

// ✅ صحيح - صورة عادية
<img 
  src="/content.jpg" 
  alt="Content" 
  loading="lazy"
  decoding="async"
/>
```

### 8.3 Prefetch للتنقل
```tsx
// عند hover على رابط
<Link 
  to="/beneficiaries"
  onMouseEnter={() => prefetchQuery('beneficiaries')}
>
  المستفيدين
</Link>
```

---

## 9. مقاييس الأداء المستهدفة

| المقياس | الهدف | الحد الأقصى |
|---------|-------|-------------|
| LCP | < 2.5s | 4.0s |
| FCP | < 1.8s | 3.0s |
| CLS | < 0.1 | 0.25 |
| TTI | < 3.8s | 7.3s |
| TBT | < 200ms | 600ms |

---

## 10. روابط مفيدة

- [Web Vitals](https://web.dev/vitals/)
- [React Query](https://tanstack.com/query/latest)
- [Workbox](https://developer.chrome.com/docs/workbox/)
- [Vite PWA](https://vite-pwa-org.netlify.app/)
