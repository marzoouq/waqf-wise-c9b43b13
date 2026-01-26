# Waqf Management System - AI Coding Agent Instructions

> **Version**: 3.1.0  
> **Last Updated**: 2026-01-24  
> **Purpose**: This document provides comprehensive guidelines for AI coding agents and developers working on the Waqf Management System.

## 📋 Project Summary

**Waqf Management System** is an Arabic-first RTL platform for managing Islamic endowments (Waqf). Built with React 18.3, TypeScript 5.5+, Tailwind CSS, and Supabase (PostgreSQL 15), this production-ready system handles:

- 👥 Beneficiary and family management
- 💰 Complete accounting system with auto-generated journal entries
- 🏢 Property and contract management
- 💵 Smart distribution system based on Waqf conditions
- 📚 Electronic archival and document management
- 📊 Advanced reporting and analytics
- 🔐 Role-based access control (7 roles)
- ✅ Multi-level approval workflows

**Repository**: `marzoouq/waqf-wise-c9b43b13`  
**Language**: Arabic (RTL-first with full English support)  
**Status**: 🟢 Production Ready (Type Safety: 99.5%)

---

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
- **Testing:** Vitest (11,000+ tests in src/__tests__/) + Playwright (E2E in e2e/)

## Directory Structure

```
src/
├── components/     # UI components only - NO business logic (600+ in 44 folders)
├── hooks/          # 170+ hooks in 36 feature folders (see ../src/hooks/README.md)
├── services/       # 42 services for ALL data operations (see ../src/services/README.md)
│   ├── beneficiary/    # Facade pattern: core, documents, analytics, tabs
│   ├── accounting/     # Facade pattern: core, reports, reconciliation
│   ├── property/       # Facade pattern: core, contracts, units, maintenance
│   └── ...             # Other services (single-file or facade)
├── types/          # TypeScript types - NEVER use `any`
├── lib/            # Utilities organized by concern:
│   ├── query-keys/         # 9 files: accounting, beneficiary, dashboard, etc. (../src/lib/query-keys/)
│   ├── query-invalidation.ts  # Batched cache invalidation helpers (../src/lib/query-invalidation.ts)
│   ├── errors/             # Error handling utilities
│   ├── pdf/                # PDF generators
│   ├── banking/            # Banking integrations
│   └── utils/              # General utilities
├── pages/          # Route pages - use hooks for data
├── routes/         # Route definitions in 7 files (see ../src/routes/README.md)
├── infrastructure/ # react-query config (QUERY_CONFIG, CACHE_TIMES) (../src/infrastructure/react-query/)
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
  ...QUERY_CONFIG.DEFAULT  // 2min stale, refetchOnWindowFocus: false
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
    severity: 'high'
  })
});

// Custom error handling
try {
  await service.operation();
} catch (error) {
  handleError(error, { 
    context: { operation: 'create', component: 'BeneficiaryForm' },
    showToast: true,
    severity: 'medium'
  });
}
```

Available severities: `'low' | 'medium' | 'high' | 'critical'`

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

- `../docs/ARCHITECTURE_RULES.md` - Strict coding rules
- `../docs/ARCHITECTURE_DECISIONS.md` - All ADRs (Architecture Decision Records)
- `../src/services/README.md` - Service layer documentation  
- `../src/hooks/README.md` - Hooks organization
- `../src/routes/README.md` - Routing structure
- `../src/lib/query-keys/` - All query keys (400+ in 9 files)
- `../src/lib/query-invalidation.ts` - Batched cache invalidation
- `../src/lib/errors/index.ts` - Error handling utilities
- `../src/infrastructure/react-query/` - Query config & cache times
- `../README.md` - Project overview

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

| File | Protection Level | Reason |
|------|-----------------|--------|
| `supabase/functions/*` | 🔴 Critical | Backend security |
| `src/lib/constants.ts` | 🟠 High | System-wide impact |
| `src/hooks/dashboard/*` | 🟡 Medium | KPI accuracy |
| `docs/ARCHITECTURE_DECISIONS.md` | 🔴 Critical | Governance |

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

---

## 🛠️ Essential Commands

### Development
```bash
npm run dev              # Start dev server (Vite) - http://localhost:5173
npm run build            # Production build
npm run preview          # Preview production build
npm run lint             # ESLint check (enforced in pre-commit)
```

### Testing
```bash
npm run test             # Run all tests (11,000+ unit/integration tests)
npm run test:watch       # Interactive watch mode
npm run test:ui          # Vitest UI mode
npm run test:coverage    # Coverage report
npm run e2e              # Playwright E2E tests
npm run e2e:ui           # Playwright UI mode
npm run e2e:headed       # E2E tests with browser
npm run e2e:debug        # E2E tests in debug mode
```

### Analysis
```bash
npm run analyze          # Bundle size visualization
```

### Supabase Edge Functions
```bash
# In supabase/ directory
supabase functions serve              # Local development
supabase functions deploy <name>      # Deploy specific function
```

**Important**: Always run tests before committing. Pre-commit hooks will run `npx lint-staged` automatically.

---

## 🔒 Boundaries & Prohibited Actions

### ❌ NEVER Do These Things

1. **Direct Database Access in Components/Pages**
   - Always use: Component → Hook → Service → Supabase
   - Exception: Realtime subscriptions in hooks via useEffect

2. **Use `any` Type**
   ```typescript
   // ❌ FORBIDDEN
   const data: any = fetchData();
   
   // ✅ REQUIRED
   const data: UserData = fetchData();
   ```

3. **Modify Protected Files Without Reading ADR**
   - `supabase/functions/*` (🔴 Critical - Backend security)
   - `src/lib/constants.ts` (🟠 High - System-wide impact)
   - `docs/ARCHITECTURE_DECISIONS.md` (🔴 Critical - Governance)
   - Any file with `🔒 PROTECTED FILE` comment

4. **Use `.single()` Instead of `.maybeSingle()`**
   ```typescript
   // ❌ DANGEROUS - throws if not found
   const { data } = await supabase.from('users').select('*').eq('id', id).single();
   
   // ✅ SAFE - returns null if not found
   const { data } = await supabase.from('users').select('*').eq('id', id).maybeSingle();
   ```

5. **Create Query Keys or Config Outside Centralized Files**
   - Always import from `@/infrastructure/react-query`
   - Never create QUERY_CONFIG or CACHE_TIMES in other files

6. **Direct Color Classes**
   ```typescript
   // ❌ FORBIDDEN - direct colors
   className="text-white bg-blue-500"
   
   // ✅ REQUIRED - semantic tokens from index.css
   className="text-foreground bg-primary"
   ```

7. **Use `left/right` Instead of `start/end` (RTL Support)**
   ```typescript
   // ❌ FORBIDDEN
   className="ml-4 text-left"
   
   // ✅ REQUIRED
   className="ms-4 text-start"
   ```

8. **Commit Sensitive Data**
   - No credentials, API keys, or secrets
   - Check `.env` files are in `.gitignore`
   - Use Supabase Edge Functions with `SERVICE_ROLE_KEY` (ADR-005)

9. **Use VACUUM in Migrations**
   - Transactions don't allow VACUUM in Supabase migrations (ADR-002)

10. **Break Architectural Decisions Without New ADR**
    - Read relevant ADR in `docs/ARCHITECTURE_DECISIONS.md` first
    - Document breaking changes in new ADR
    - Get explicit approval

### ✅ Safe Directories to Modify
- `src/components/` (UI components)
- `src/hooks/` (Custom hooks following patterns)
- `src/services/` (Following facade pattern for large services)
- `src/pages/` (Route pages)
- `src/types/` (TypeScript types)
- `src/lib/utils/` (Utility functions)
- Tests files (`src/__tests__/`, `e2e/`)
- Documentation (`docs/`, `README.md`, etc.)

---

## 📚 Key Documentation References

**Must Read Before Major Changes:**
- [`docs/ARCHITECTURE_RULES.md`](../docs/ARCHITECTURE_RULES.md) - Strict coding rules (Arabic + English)
- [`docs/ARCHITECTURE_DECISIONS.md`](../docs/ARCHITECTURE_DECISIONS.md) - All ADRs (Architecture Decision Records)
- [`docs/SECURITY_GUIDELINES.md`](../docs/SECURITY_GUIDELINES.md) - Security best practices
- [`docs/ROLES_AND_PERMISSIONS.md`](../docs/ROLES_AND_PERMISSIONS.md) - Complete RBAC system

**Architecture & Patterns:**
- [`src/services/README.md`](../src/services/README.md) - Service layer documentation (42 services)
- [`src/hooks/README.md`](../src/hooks/README.md) - Hooks organization (170+ hooks in 36 folders)
- [`src/routes/README.md`](../src/routes/README.md) - Routing structure (7 route files)

**Technical References:**
- [`src/lib/query-keys/`](../src/lib/query-keys/) - All query keys (400+ in 9 files)
- [`src/lib/query-invalidation.ts`](../src/lib/query-invalidation.ts) - Batched cache invalidation helpers
- [`src/lib/errors/index.ts`](../src/lib/errors/index.ts) - Error handling utilities
- [`src/infrastructure/react-query/`](../src/infrastructure/react-query/) - Query config & cache times
- [`README.md`](../README.md) - Project overview (Arabic)
- [`AI_CODING_AGENT.md`](../AI_CODING_AGENT.md) - Additional developer guidance

---

## 🎯 Contribution Guidelines for AI Agents

### Before Making Changes

1. **Understand the Issue Completely**
   - Read the issue description and all comments
   - Understand the user's requirements (may be in Arabic)
   - Check for related issues or PRs

2. **Explore the Codebase**
   - Use `grep` or `glob` tools to find relevant files
   - Read existing implementations of similar features
   - Check the test structure

3. **Plan Your Changes**
   - Make minimal, surgical changes
   - Follow existing patterns consistently
   - Avoid breaking existing functionality

### While Making Changes

1. **Follow the Architecture**
   - Component → Hook → Service → Supabase (always)
   - Use facade pattern for large services
   - Keep components focused on UI only

2. **Write Tests**
   - Add tests for new features
   - Update tests for modified features
   - Ensure tests pass before committing

3. **Type Safety**
   - Never use `any` type
   - Define explicit types in `src/types/`
   - Use existing types when available

4. **Error Handling**
   ```typescript
   import { handleError, showSuccess, createMutationErrorHandler } from '@/lib/errors';
   
   // In mutations
   useMutation({
     mutationFn: () => BeneficiaryService.create(data),
     onSuccess: () => showSuccess('تم الإنشاء بنجاح'),
     onError: createMutationErrorHandler({ 
       context: 'create-beneficiary',
       severity: 'high'
     })
   });
   ```

### After Making Changes

1. **Test Thoroughly**
   ```bash
   npm run lint          # Check code style
   npm run test          # Run unit/integration tests
   npm run e2e           # Run E2E tests (if UI changes)
   npm run build         # Ensure build succeeds
   ```

2. **Verify Changes**
   - Run the app locally and test the feature
   - Check console for errors
   - Verify RTL support for Arabic text
   - Test different user roles (if applicable)

3. **Document Changes**
   - Update relevant documentation
   - Add comments for complex logic
   - Update CHANGELOG.md for significant changes

4. **Commit with Clear Messages**
   - Use descriptive commit messages
   - Reference issue numbers
   - Use conventional commits format

---

**آخر تحديث:** 2026-01-24 | **الإصدار:** 3.1.0
