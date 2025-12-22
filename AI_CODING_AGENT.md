# Waqf Management System - AI Coding Agent Instructions

> **Version**: 2.9.30  
> **Last Updated**: 2025-12-22

## Architecture Overview

This is an **Arabic-first RTL Waqf (Islamic endowment) management platform** built with React + TypeScript + Tailwind + Supabase.

### Core Architecture Pattern (MANDATORY)

```
Component (UI) → Hook (State) → Service (Data) → Supabase
```

**NEVER** call Supabase directly from components or pages. All data access flows through this layered architecture.

## Directory Structure

```
src/
├── components/     # UI components only - NO business logic (~600 in 44 folders)
├── hooks/          # 300+ hooks in 38 feature folders (see src/hooks/README.md)
├── services/       # 60+ services for ALL data operations (see src/services/README.md)
├── types/          # TypeScript types - NEVER use `any`
├── lib/            # Utilities: QUERY_KEYS (350+ in 8 files), errors, query-invalidation
├── pages/          # Route pages - use hooks for data (~60 pages)
└── routes/         # Route definitions in 7 files (see src/routes/README.md)
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
import { QUERY_KEYS, QUERY_CONFIG } from '@/lib/query-keys';

// 350+ keys organized in 8 domain files
useQuery({ 
  queryKey: QUERY_KEYS.BENEFICIARIES,
  queryFn: () => BeneficiaryService.getAll(),
  ...QUERY_CONFIG.DEFAULT  // 2min stale, refetchOnWindowFocus
});

// Available configs:
// QUERY_CONFIG.DEFAULT   - 2min stale, refetchOnWindowFocus
// QUERY_CONFIG.REPORTS   - 2min stale, 5min refetchInterval
// QUERY_CONFIG.REALTIME  - 30s stale
// QUERY_CONFIG.STATIC    - 30min stale
```

### 4. Service Pattern (Facade for Large Services)
```typescript
// Simple service
import { BeneficiaryService } from '@/services';
const { data } = useQuery({
  queryKey: QUERY_KEYS.BENEFICIARIES,
  queryFn: () => BeneficiaryService.getAll()
});

// Large services use facade pattern (beneficiary, accounting, report, dashboard)
src/services/beneficiary/
├── index.ts              # Re-exports all (facade)
├── core.service.ts       # CRUD operations
├── documents.service.ts  # Document handling
├── analytics.service.ts  # Statistics
└── tabs.service.ts       # Portal tabs data
```

### 5. Cache Invalidation (BATCHED)
```typescript
// ❌ WRONG - multiple individual calls
queryClient.invalidateQueries({ queryKey: ['journal-entries'] });
queryClient.invalidateQueries({ queryKey: ['accounts'] });
queryClient.invalidateQueries({ queryKey: ['trial-balance'] });

// ✅ CORRECT - batched invalidation
import { invalidateAccountingQueries } from '@/lib/query-invalidation';
invalidateAccountingQueries(queryClient); // Invalidates all related queries
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
import { handleError, showSuccess } from '@/lib/errors';

// In mutations
useMutation({
  mutationFn: () => BeneficiaryService.create(data),
  onSuccess: () => showSuccess('تم الإنشاء بنجاح'),
  onError: (error: unknown) => {
    handleError(error, { context: { operation: 'create', component: 'BeneficiaryForm' } });
  }
});
```

## Design System

### Colors - Use Semantic Tokens ONLY
```typescript
// ❌ FORBIDDEN - direct colors
className="text-white bg-blue-500"

// ✅ REQUIRED - semantic tokens from index.css
className="text-foreground bg-primary"
```

Key tokens: `--background`, `--foreground`, `--primary`, `--secondary`, `--muted`, `--accent`, `--destructive`, `--heir-wife`, `--heir-son`, `--heir-daughter`, `--status-success`, `--status-warning`, `--status-error`

### RTL Support
All components must support Arabic RTL layout. Use `start/end` instead of `left/right`.

## Role-Based Access

| Role | Arabic | Access Level |
|------|--------|--------------|
| nazer | الناظر | Full system control, approvals, visibility settings |
| admin | المدير | System settings, users management |
| accountant | المحاسب | Accounting, reports, financial operations |
| cashier | أمين الصندوق | Payments, POS, collection center |
| archivist | الأرشيفي | Documents, archive management |
| beneficiary | المستفيد | Personal portal only (own data) |
| waqf_heir | وريث الوقف | Full transparency view (all waqf data) |

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
npx vitest run          # Run all tests (408+ tests)
npx vitest              # Interactive watch mode
npx vitest --ui         # UI mode
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

### Test Setup & Mocks (Important)
- The vitest setup is in `src/test/setup.ts` and is loaded via `vitest.config.ts` (see `setupFiles`).
- `src/test/setup.ts` exports `setMockTableData/tableData` helpers to mock Supabase `from()` results for tests.
- It also mocks `@/integrations/supabase/client`, `sonner` toasts, and `useToast` hook globally.
- Use `setMockTableData('tableName', rows)` before rendering to emulate database rows for a test.
- Note: console errors/warnings are suppressed in tests — always assert expected failures explicitly.

## Files to Reference

- `docs/ARCHITECTURE_RULES.md` - Strict coding rules
- `src/services/README.md` - Service layer documentation  
- `src/hooks/README.md` - Hooks organization
- `src/routes/README.md` - Routing structure
- `src/lib/query-keys.ts` - All query keys (370+)
- `src/lib/query-invalidation.ts` - Batched cache invalidation
- `src/lib/errors/index.ts` - Error handling utilities
- `src/test/setup.ts` - Vitest global mocks (Supabase, sonner, matchMedia)
- `vitest.config.ts` - Vitest config references `src/test/setup.ts`
- `package.json` - npm scripts: `dev`, `build`, `test`, `lint`
- `.husky/pre-commit` - Runs `npx lint-staged` (pre-commit checks)

## Developer Workflows (Quick)
- Local dev: `npm run dev` (vite)
- Build: `npm run build`, Preview production: `npm run preview`
- Tests: `npx vitest run`, Coverage: `npx vitest run --coverage`
- E2E tests: `npx playwright test`
- Lint: `npm run lint` (pre-commit runs lint via husky and lint-staged)

## Warnings & Anti-Patterns (Concrete)
- NEVER call Supabase directly from components or pages. Use hooks/services only.
- Do not use `any` type — the project enforces explicit types across services and hooks.
- Avoid multiple `queryClient.invalidateQueries` calls — use the provided batched helpers like those in `src/lib/query-invalidation.ts`.
- When retrieving a single record, prefer `.maybeSingle()` vs `.single()` to avoid thrown errors.
- Realtime subscriptions are only allowed inside hooks (via `useEffect`) and should usually use `RealtimeService` or hook-level unified subscriptions.

## Common Patterns & Short Examples
- Component → Hook → Service flow (always):
```typescript
// component.tsx
const { data } = useBeneficiaries(); // hook uses service

// hooks/beneficiary.ts
return useQuery({ queryKey: [QUERY_KEYS.BENEFICIARIES], queryFn: () => BeneficiaryService.getAll() });

// src/services/beneficiary/index.ts (facade)
export * from './core.service';
```
- Query config usage (always include `QUERY_CONFIG` when using queries):
```typescript
useQuery({ queryKey: QUERY_KEYS.BENEFICIARIES, queryFn: () => BeneficiaryService.getAll(), ...QUERY_CONFIG.DEFAULT })
```

---

**هذا الدليل مخصص للـ AI Coding Agents والمطورين الجدد**
