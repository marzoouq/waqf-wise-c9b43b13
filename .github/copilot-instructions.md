# Waqf Management System - AI Coding Agent Instructions

## Architecture Overview

This is an **Arabic-first RTL Waqf (Islamic endowment) management platform** built with React + TypeScript + Tailwind + Supabase.

### Core Architecture Pattern (MANDATORY)

```
Component (UI) → Hook (State) → Service (Data) → Supabase
```

**NEVER** call Supabase directly from components or pages. All data access flows through this layered architecture.

### Technology Stack

- **Frontend:** React 18.3 + TypeScript 5.5+ + Vite + Tailwind CSS + shadcn/ui
- **Backend:** Supabase (PostgreSQL 15 + Edge Functions + Row Level Security + Realtime)
- **State:** React Query (TanStack Query) + AuthContext
- **Testing:** Vitest (11,000+ tests in src/**tests**/) + Playwright (E2E in e2e/)

## Directory Structure

```
src/
├── components/     # UI components only - NO business logic (600+ in 44 folders)
├── hooks/          # 170+ hooks in 36 feature folders (see src/hooks/README.md)
├── services/       # 42 services for ALL data operations (see src/services/README.md)
│   ├── beneficiary/    # Facade pattern: core, documents, analytics, tabs
│   ├── accounting/     # Facade pattern: core, reports, reconciliation
│   ├── property/       # Facade pattern: core, contracts, units, maintenance
│   └── ...             # Other services (single-file or facade)
├── types/          # TypeScript types - NEVER use `any`
├── lib/            # Utilities organized by concern:
│   ├── query-keys/         # 9 files: accounting, beneficiary, dashboard, etc.
│   ├── query-invalidation.ts  # Batched cache invalidation helpers
│   ├── errors/             # Error handling utilities
│   ├── pdf/                # PDF generators
│   ├── banking/            # Banking integrations
│   └── utils/              # General utilities
├── pages/          # Route pages - use hooks for data
├── routes/         # Route definitions in 7 files (see src/routes/README.md)
├── infrastructure/ # react-query config (QUERY_CONFIG, CACHE_TIMES)
└── contexts/       # AuthContext (single source of truth for auth)
supabase/
└── functions/      # 55+ Edge Functions (secured with service_role)
```

## Critical Rules

### 1. TypeScript Strictness

```typescript
// ❌ FORBIDDEN - any type
const data: any = fetchData();

// ✅ REQUIRED - explicit types
const data: UserData = fetchData();
```

### 2. Supabase Query Safety

```typescript
// ❌ DANGEROUS - throws if not found
const { data } = await supabase.from('users').select('*').eq('id', id).single();

// ✅ SAFE - returns null if not found
const { data } = await supabase.from('users').select('*').eq('id', id).maybeSingle();
```

### 3. Query Keys & Config (ALWAYS use centralized)

```typescript
import { QUERY_KEYS, QUERY_CONFIG, CACHE_TIMES } from '@/infrastructure/react-query';

// 400+ keys organized by domain in 9 files:
// accounting.keys.ts, beneficiary.keys.ts, dashboard.keys.ts, payments.keys.ts,
// properties.keys.ts, support.keys.ts, system.keys.ts, users.keys.ts
useQuery({
  queryKey: QUERY_KEYS.BENEFICIARIES,
  queryFn: () => BeneficiaryService.getAll(),
  ...QUERY_CONFIG.DEFAULT, // 2min stale, refetchOnWindowFocus: false
});

// Available configs (src/infrastructure/react-query/queryConfig.ts):
// QUERY_CONFIG.DEFAULT         - 2min stale, refetchOnWindowFocus: false
// QUERY_CONFIG.DASHBOARD_KPIS  - 1min stale, 5min refetchInterval
// QUERY_CONFIG.ADMIN_KPIS      - 1min stale, 5min refetchInterval
// QUERY_CONFIG.REPORTS         - 2min stale, 5min refetchInterval
// QUERY_CONFIG.REALTIME        - 30s stale, refetchOnWindowFocus: true
// QUERY_CONFIG.STATIC          - 30min stale, no refetch
// QUERY_CONFIG.APPROVALS       - 1min stale
// QUERY_CONFIG.ALERTS          - 30s stale
```

**NEVER** create QUERY_CONFIG or CACHE_TIMES in other files. Always import from `@/infrastructure/react-query`.

### 4. Service Pattern (Facade for Large Services)

```typescript
// Simple service (single file)
import { BeneficiaryService } from '@/services';
const { data } = useQuery({
  queryKey: QUERY_KEYS.BENEFICIARIES,
  queryFn: () => BeneficiaryService.getAll()
});

// Large services use facade pattern (beneficiary, accounting, property, distribution, report, dashboard)
src/services/beneficiary/
├── index.ts              # Re-exports all (facade)
├── core.service.ts       # CRUD operations
├── documents.service.ts  # Document handling
├── analytics.service.ts  # Statistics
└── tabs.service.ts       # Portal tabs data

// Services are classes with static methods
export class BeneficiaryService {
  static async getAll(): Promise<Beneficiary[]> {
    const { data, error } = await supabase
      .from('beneficiaries')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }
}
```

### 5. Cache Invalidation (BATCHED)

```typescript
// ❌ WRONG - multiple individual calls
queryClient.invalidateQueries({ queryKey: ['journal-entries'] });
queryClient.invalidateQueries({ queryKey: ['accounts'] });
queryClient.invalidateQueries({ queryKey: ['trial-balance'] });

// ✅ CORRECT - batched invalidation (uses predicate internally)
import { invalidateAccountingQueries } from '@/lib/query-invalidation';
invalidateAccountingQueries(queryClient); // Invalidates all related queries in one call

// Available batched invalidators:
// invalidateQueryGroups(queryClient, ['accounting', 'beneficiaries', 'payments'])
// invalidateAccountingQueries(queryClient)
// invalidateBeneficiaryQueries(queryClient)
// invalidatePropertyQueries(queryClient)
```

### 6. Realtime Subscriptions (Exception to service rule)

```typescript
// Realtime acceptable in hooks via useEffect (requires lifecycle)
useEffect(() => {
  const subscription = supabase
    .channel('beneficiaries')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'beneficiaries' }, callback)
    .subscribe();
  return () => subscription.unsubscribe();
}, []);

// Dashboard unified realtime (preferred pattern)
import { useNazerDashboardRealtime } from '@/hooks/nazer/useNazerDashboardRealtime';
// Subscribes to 10+ tables in one channel, auto-invalidates React Query cache
```

### 7. Error Handling

```typescript
import { handleError, showSuccess, createMutationErrorHandler } from '@/lib/errors';

// In mutations (simple)
useMutation({
  mutationFn: () => BeneficiaryService.create(data),
  onSuccess: () => showSuccess('تم الإنشاء بنجاح'),
  onError: createMutationErrorHandler({
    context: 'create-beneficiary',
    severity: 'high',
  }),
});

// Custom error handling
try {
  await service.operation();
} catch (error) {
  handleError(error, {
    context: { operation: 'create', component: 'BeneficiaryForm' },
    showToast: true,
    severity: 'medium',
  });
}
```

Available severities: `'low' | 'medium' | 'high' | 'critical'`

## Design System

### Colors - Use Semantic Tokens ONLY

```typescript
// ❌ FORBIDDEN - direct colors
className = 'text-white bg-blue-500';

// ✅ REQUIRED - semantic tokens from index.css
className = 'text-foreground bg-primary';
```

Key tokens: `--background`, `--foreground`, `--primary`, `--secondary`, `--muted`, `--accent`, `--destructive`, `--heir-wife`, `--heir-son`, `--heir-daughter`, `--status-success`, `--status-warning`, `--status-error`

### RTL Support

All components must support Arabic RTL layout. Use `start/end` instead of `left/right`.

## Role-Based Access

| Role        | Arabic       | Access Level                                        |
| ----------- | ------------ | --------------------------------------------------- |
| nazer       | الناظر       | Full system control, approvals, visibility settings |
| admin       | المدير       | System settings, users management                   |
| accountant  | المحاسب      | Accounting, reports, financial operations           |
| cashier     | أمين الصندوق | Payments, POS, collection center                    |
| archivist   | الأرشيفي     | Documents, archive management                       |
| beneficiary | المستفيد     | Personal portal only (own data)                     |
| waqf_heir   | وريث الوقف   | Full transparency view (all waqf data)              |

Check `src/hooks/auth/usePermissions.ts` for permission patterns.

## Performance Patterns

### Parallel Queries (MANDATORY for dashboards)

```typescript
// ❌ SLOW - sequential
const beneficiaries = await BeneficiaryService.getAll();
const properties = await PropertyService.getAll();

// ✅ FAST - parallel (60% faster)
const [beneficiaries, properties, payments] = await Promise.all([
  BeneficiaryService.getAll(),
  PropertyService.getAll(),
  PaymentService.getAll(),
]);
```

### Lazy Tab Loading

```typescript
// Use LazyTabContent for dashboard tabs
<LazyTabContent isActive={activeTab === 'reports'}>
  <ReportsTab />
</LazyTabContent>
```

## Testing

### Commands

```bash
npx vitest run          # Run all tests (11,000+ tests)
npx vitest              # Interactive watch mode
npx vitest --ui         # UI mode
npx vitest --coverage   # Coverage report
npm run test            # Alias for vitest run
npm run test:watch      # Alias for vitest watch
```

### Test Structure

```
src/__tests__/
├── unit/
│   ├── services/       # Service unit tests
│   ├── hooks/          # Hook tests (require AuthProvider wrapper)
│   └── components/     # Component tests
├── integration/        # Integration tests
└── utils/
    └── test-utils.tsx  # Render with all providers

e2e/
├── auth.spec.ts        # Authentication flows
├── beneficiary-lifecycle.spec.ts
├── navigation.spec.ts
└── accessibility.spec.ts
```

### Test Utilities

```typescript
import { render, screen } from '@/__tests__/utils/test-utils';
import { setMockTableData } from '@/test/setup';

// All hooks require AuthProvider wrapper
const createWrapper = () => ({ children }) => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>{children}</AuthProvider>
  </QueryClientProvider>
);
```

## Files to Reference

- `docs/ARCHITECTURE_RULES.md` - Strict coding rules
- `docs/ARCHITECTURE_DECISIONS.md` - All ADRs (Architecture Decision Records)
- `src/services/README.md` - Service layer documentation
- `src/hooks/README.md` - Hooks organization
- `src/routes/README.md` - Routing structure
- `src/lib/query-keys/` - All query keys (400+ in 9 files)
- `src/lib/query-invalidation.ts` - Batched cache invalidation
- `src/lib/errors/index.ts` - Error handling utilities
- `src/infrastructure/react-query/` - Query config & cache times

---

## 🔒 Protected Files

### Before Modifying Protected Files

Any file with `🔒 PROTECTED FILE` comment requires:

1. Read the associated ADR in `docs/ARCHITECTURE_DECISIONS.md`
2. Ensure changes comply with existing decisions
3. If breaking an ADR, propose a new ADR first
4. Get security review for security-related files

### ADR References in Code

When you see these comments, understand their meaning:

- `// ADR-001` - Tenant table closure (USING false)
- `// ADR-004` - Limit restrictions (max 500 without pagination)
- `// ADR-005` - Service Role usage in Edge Functions

### Protected File List

| File                             | Protection Level | Reason             |
| -------------------------------- | ---------------- | ------------------ |
| `supabase/functions/*`           | 🔴 Critical      | Backend security   |
| `src/lib/constants.ts`           | 🟠 High          | System-wide impact |
| `src/hooks/dashboard/*`          | 🟡 Medium        | KPI accuracy       |
| `docs/ARCHITECTURE_DECISIONS.md` | 🔴 Critical      | Governance         |

### Golden Rule

> ❗ **No ADR = No architectural change**

If you need to break an existing ADR, you MUST:

1. Document why in a new ADR
2. Get explicit approval
3. Update all affected files

---

## Development Workflow

### Build & Run

```bash
npm run dev              # Start dev server (Vite)
npm run build            # Production build
npm run preview          # Preview production build
npm run lint             # ESLint check
```

### Edge Functions (Supabase)

```bash
# In supabase/ directory
supabase functions serve  # Local development
supabase functions deploy <function-name>  # Deploy
```

**Important:** All Edge Functions use `SERVICE_ROLE_KEY` for secure database access (ADR-005).

### Database Migrations

```bash
# NEVER use VACUUM in migrations (ADR-002)
# Transactions don't allow VACUUM in Supabase migrations
```

---

**آخر تحديث:** 2026-01-22 | **الإصدار:** 3.1.0
