# Waqf Management System - AI Coding Agent Instructions

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
├── components/     # UI components only - NO business logic
├── hooks/          # 170+ hooks in 25 feature folders (see src/hooks/README.md)
├── services/       # 42+ services for ALL data operations (see src/services/README.md)
├── types/          # TypeScript types - NEVER use `any`
├── lib/            # Utilities including QUERY_KEYS (src/lib/query-keys.ts)
├── pages/          # Route pages - use hooks for data
└── routes/         # Route definitions in 6 files (see src/routes/README.md)
```

## Critical Rules

### 1. TypeScript Strictness
```typescript
// ❌ FORBIDDEN
const data: any = fetchData();

// ✅ REQUIRED
const data: UserData = fetchData();
```

### 2. Supabase Query Safety
```typescript
// ❌ DANGEROUS - fails if record doesn't exist
const { data } = await supabase.from('users').select('*').eq('id', id).single();

// ✅ SAFE - returns null if not found
const { data } = await supabase.from('users').select('*').eq('id', id).maybeSingle();
```

### 3. Query Keys (Use QUERY_KEYS from src/lib/query-keys.ts)
```typescript
import { QUERY_KEYS, QUERY_CONFIG } from '@/lib/query-keys';

// ✅ Use centralized keys
useQuery({ queryKey: QUERY_KEYS.BENEFICIARIES, ...QUERY_CONFIG.DEFAULT });
```

### 4. Service Pattern
```typescript
// In hooks, call services - NOT Supabase directly
import { BeneficiaryService } from '@/services';

const { data } = useQuery({
  queryKey: QUERY_KEYS.BENEFICIARIES,
  queryFn: () => BeneficiaryService.getAll()
});
```

### 5. Realtime Subscriptions
Realtime subscriptions are the **only exception** - acceptable in hooks using `useEffect`:
```typescript
useEffect(() => {
  const subscription = supabase
    .channel('beneficiaries')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'beneficiaries' }, callback)
    .subscribe();
  return () => subscription.unsubscribe();
}, []);
```

## Design System

### Colors - Use Semantic Tokens ONLY
```typescript
// ❌ FORBIDDEN - direct colors
className="text-white bg-blue-500"

// ✅ REQUIRED - semantic tokens from index.css
className="text-foreground bg-primary"
```

Key semantic tokens: `--background`, `--foreground`, `--primary`, `--secondary`, `--muted`, `--accent`, `--destructive`

### RTL Support
All components must support Arabic RTL layout. Use directional utilities like `start/end` instead of `left/right`.

## Key Patterns

### Hook Creation
```typescript
// src/hooks/beneficiary/useBeneficiaries.ts
export function useBeneficiaries() {
  return useQuery({
    queryKey: QUERY_KEYS.BENEFICIARIES,
    queryFn: () => BeneficiaryService.getAll(),
    ...QUERY_CONFIG.DEFAULT
  });
}
```

### Service Creation
```typescript
// src/services/beneficiary.service.ts
export class BeneficiaryService {
  static async getAll(): Promise<Beneficiary[]> {
    const { data, error } = await supabase
      .from('beneficiaries')
      .select('*');
    if (error) throw error;
    return data ?? [];
  }
}
```

### Cache Invalidation
Use batched invalidation from `src/lib/query-invalidation.ts`:
```typescript
import { invalidateBeneficiaryQueries } from '@/lib/query-invalidation';
```

## Testing

```bash
npx vitest run          # Run all tests
npx vitest              # Interactive mode
```

## Database Types

**NEVER** edit `src/integrations/supabase/types.ts` - it's auto-generated.

Import types from there:
```typescript
import { Database } from '@/integrations/supabase/types';
type Beneficiary = Database['public']['Tables']['beneficiaries']['Row'];
```

## Role-Based Access

Roles: `nazer` (supervisor), `admin`, `accountant`, `cashier`, `archivist`, `beneficiary`, `waqf_heir`

Check `src/hooks/auth/usePermissions.ts` for permission patterns.

## Performance Patterns

1. **Parallel Queries**: Use `Promise.all` for independent fetches
2. **Lazy Loading**: Use `React.lazy()` for route-level code splitting
3. **Unified KPIs**: Use `useUnifiedKPIs` hook as single source of truth for dashboard metrics

## Files to Reference

- `docs/ARCHITECTURE_RULES.md` - Strict coding rules
- `src/services/README.md` - Service layer documentation
- `src/hooks/README.md` - Hooks organization
- `src/routes/README.md` - Routing structure
- `src/lib/query-keys.ts` - All query keys
