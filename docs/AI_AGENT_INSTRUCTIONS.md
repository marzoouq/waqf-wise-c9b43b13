# Waqf Management System - AI Coding Agent Instructions

## Architecture Overview

Arabic-first RTL Waqf management platform using React + TypeScript + Tailwind + Supabase.

**Core Pattern (MANDATORY):** Component (UI) → Hook (State) → Service (Data) → Supabase

Never call Supabase directly from components/pages.

---

## Directory Structure

```
src/
├── components/     # UI only, no business logic
├── hooks/          # 175+ hooks in 36 feature folders
├── services/       # 55+ services for all data operations
├── types/          # Strict TypeScript types, no `any`
├── lib/            # QUERY_KEYS, errors, query-invalidation
├── pages/          # Route pages using hooks
└── routes/         # Route definitions
```

---

## Critical Rules

### 1. TypeScript
- Explicit types only, **no `any`**
- Use `unknown` for dynamic data, then narrow with type guards

### 2. Supabase Safety
- Use `.maybeSingle()` instead of `.single()` to avoid errors on empty results
- All queries go through services, never direct calls

### 3. Query Keys
- Always use centralized `QUERY_KEYS` from `src/lib/query-keys.ts`
- Use `QUERY_CONFIG` for staleTime and refetch settings

### 4. Service Pattern
- Use facade pattern for large services (e.g., beneficiary, accounting)
- Services split into subdirectories with index.ts re-exports

### 5. Cache Invalidation
- Use batched invalidation via `src/lib/query-invalidation.ts`
- Functions: `invalidateAccountingQueries`, `invalidateBeneficiaryQueries`, etc.

### 6. Realtime
- Only in hooks via `useEffect`
- Prefer unified subscriptions (e.g., `useNazerDashboardRealtime`)

### 7. Error Handling
- Use `handleError` from error utilities
- Use `showSuccess` for toast notifications

---

## Design System

### Colors
- **Semantic tokens only** (e.g., `text-foreground`, `bg-primary`)
- Never use direct colors like `text-white`, `bg-black`
- All colors must be HSL in `index.css`

### RTL Layout
- Use `start/end` instead of `left/right`
- Use `ms-*` / `me-*` instead of `ml-*` / `mr-*`

---

## Role-Based Access

| Role | Access Level |
|------|-------------|
| `nazer` | Full system control |
| `admin` | System administration |
| `accountant` | Financial operations |
| `cashier` | Payment processing |
| `archivist` | Document management |
| `beneficiary` | Own data only |
| `waqf_heir` | Full transparency |

---

## Performance

- **Parallel queries** for dashboards using `Promise.all`
- **Lazy tab loading** with `LazyTabContent` component
- **Unified Realtime** subscriptions per dashboard

---

## Testing

### Commands
```bash
npx vitest run          # Run all tests
npx vitest --ui         # Interactive UI
npx vitest run --watch  # Watch mode
```

### Structure
```
src/__tests__/
├── unit/
│   ├── services/
│   ├── hooks/
│   └── components/
├── integration/
└── e2e/
```

### Mocking
- Use `setMockTableData` for Supabase query mocks
- Import `mockSupabase` from `src/__tests__/utils/supabase.mock.ts`

---

## Developer Workflows

```bash
npm run dev      # Development server
npm run build    # Production build
npm run test     # Run tests
npm run lint     # ESLint check
```

---

## Key Files

| File | Purpose |
|------|---------|
| `docs/ARCHITECTURE_RULES.md` | Detailed architecture rules |
| `src/services/README.md` | Service layer documentation |
| `src/hooks/README.md` | Hooks organization guide |
| `src/lib/query-keys.ts` | Centralized query keys |
| `src/lib/query-invalidation.ts` | Batched cache invalidation |

---

## Quick Reference

### Creating a New Feature

1. **Create Service** in `src/services/`
2. **Create Hook** in `src/hooks/{feature}/`
3. **Create Component** in `src/components/{feature}/`
4. **Add Query Key** to `src/lib/query-keys.ts`
5. **Add Invalidation** to relevant function in `query-invalidation.ts`

### Common Patterns

```typescript
// ✅ Correct: Hook using Service
const { data } = useQuery({
  queryKey: QUERY_KEYS.BENEFICIARIES,
  queryFn: () => BeneficiaryService.getAll(),
});

// ❌ Wrong: Direct Supabase call
const { data } = useQuery({
  queryKey: ['beneficiaries'],
  queryFn: async () => {
    const { data } = await supabase.from('beneficiaries').select('*');
    return data;
  },
});
```

---

**Version:** 2.9.3 | **Last Updated:** 2025-12-13
