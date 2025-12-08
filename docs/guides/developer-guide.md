# 👨‍💻 دليل المطور | Developer Guide

**الإصدار:** 2.6.42 | **آخر تحديث:** 2025-12-08

---

## 🚀 البدء السريع

### المتطلبات
- Node.js 18+
- npm أو bun
- حساب Lovable Cloud

### التثبيت
```bash
# استنساخ المشروع
git clone <repository-url>

# تثبيت التبعيات
npm install

# تشغيل التطوير
npm run dev
```

---

## 📁 هيكل المشروع

```
src/
├── assets/              # الصور والملفات الثابتة
├── components/          # المكونات (~360 مكون)
│   ├── accounting/      # المحاسبة
│   ├── auth/            # المصادقة
│   ├── beneficiary/     # المستفيدين
│   ├── contracts/       # العقود
│   ├── dashboard/       # لوحات التحكم
│   │   ├── accountant/  # لوحة المحاسب
│   │   ├── cashier/     # لوحة أمين الصندوق
│   │   └── nazer/       # لوحة الناظر
│   ├── distributions/   # التوزيعات
│   ├── properties/      # العقارات
│   ├── reports/         # التقارير
│   ├── shared/          # مكونات مشتركة
│   ├── tenants/         # المستأجرين ✨
│   ├── ui/              # مكونات Shadcn
│   └── waqf/            # الوقف
├── hooks/               # Custom Hooks (~170)
│   ├── accounting/      # محاسبة
│   ├── admin/           # إدارة
│   ├── ai/              # الذكاء الاصطناعي
│   ├── archive/         # الأرشفة
│   ├── auth/            # مصادقة
│   ├── beneficiary/     # مستفيدين
│   ├── dashboard/       # لوحات تحكم
│   ├── distributions/   # توزيعات
│   ├── fiscal-years/    # السنوات المالية
│   ├── governance/      # الحوكمة
│   ├── messages/        # الرسائل
│   ├── notifications/   # الإشعارات
│   ├── payments/        # مدفوعات
│   ├── performance/     # الأداء
│   ├── pos/             # نقطة البيع
│   ├── property/        # عقارات + مستأجرين ✨
│   ├── reports/         # تقارير
│   ├── requests/        # الطلبات
│   ├── security/        # الأمان
│   ├── settings/        # الإعدادات
│   ├── support/         # الدعم
│   ├── system/          # النظام
│   ├── transactions/    # المعاملات
│   ├── ui/              # واجهة المستخدم
│   └── users/           # المستخدمين
├── integrations/        # التكاملات
│   └── supabase/        # Supabase client & types
├── lib/                 # المكتبات المساعدة
│   ├── excel-helper.ts  # تصدير Excel
│   ├── fonts/           # الخطوط العربية
│   └── version.ts       # معلومات الإصدار
├── pages/               # الصفحات (~76)
├── routes/              # التوجيه (~71 مسار)
├── services/            # الخدمات
│   ├── auth.service.ts
│   ├── archive.service.ts
│   ├── loans.service.ts
│   ├── dashboard.service.ts  # 🆕 خدمة لوحة التحكم
│   └── README.md
└── types/               # الأنواع
    └── tenants.ts       # أنواع المستأجرين
```

---

## 🎨 معايير الكود

### تسمية الملفات
| النوع | التسمية | مثال |
|-------|---------|------|
| Component | PascalCase.tsx | `TenantDialog.tsx` |
| Hook | useCamelCase.ts | `useTenantLedger.ts` |
| Utility | camelCase.ts | `exportHelpers.ts` |
| Type | camelCase.ts | `tenants.ts` |
| Service | PascalCase.ts | `AuthService.ts` |

### هيكل المكون
```tsx
// 1. Imports
import { useState } from 'react';
import { useTenants } from '@/hooks/property/useTenants';
import { Button } from '@/components/ui/button';

// 2. Types
interface TenantCardProps {
  tenantId: string;
  onEdit?: (id: string) => void;
}

// 3. Component
export const TenantCard = ({ tenantId, onEdit }: TenantCardProps) => {
  // 4. Hooks (دائماً في الأعلى)
  const { tenants, isLoading } = useTenants();
  
  // 5. State
  const [isOpen, setIsOpen] = useState(false);
  
  // 6. Derived Data
  const tenant = tenants.find(t => t.id === tenantId);
  
  // 7. Handlers
  const handleEdit = () => onEdit?.(tenantId);
  
  // 8. Early Returns
  if (isLoading) return <Skeleton />;
  if (!tenant) return null;
  
  // 9. Render
  return (
    <Card>
      <CardHeader>
        <CardTitle>{tenant.full_name}</CardTitle>
      </CardHeader>
      <CardContent>
        <Button onClick={handleEdit}>تعديل</Button>
      </CardContent>
    </Card>
  );
};
```

---

## 🪝 إنشاء Hook جديد

### الموقع
```
src/hooks/{category}/use{Name}.ts
```

### النمط الموصى به: Hook → Service → Supabase
```typescript
// ✅ صحيح - Hook يستخدم Service
import { useQuery } from '@tanstack/react-query';
import { DashboardService } from '@/services';
import { QUERY_STALE_TIME } from '@/lib/constants';

export function useNazerSystemOverview() {
  return useQuery({
    queryKey: ['nazer-system-overview'],
    queryFn: () => DashboardService.getSystemOverview(),
    staleTime: QUERY_STALE_TIME.DASHBOARD,
  });
}
```

### قالب Hook للقراءة (استخدام مباشر - غير موصى)
```typescript
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Tenant } from '@/types/tenants';

export function useTenants() {
  return useQuery({
    queryKey: ['tenants'],
    queryFn: async (): Promise<Tenant[]> => {
      const { data, error } = await supabase
        .from('tenants')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    staleTime: 2 * 60 * 1000, // دقيقتان
  });
}
```

### قالب Hook مع Mutations
```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { Tenant, TenantInsert } from '@/types/tenants';

export function useTenants() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Query
  const { data: tenants = [], isLoading } = useQuery({
    queryKey: ['tenants'],
    queryFn: async (): Promise<Tenant[]> => {
      const { data, error } = await supabase
        .from('tenants')
        .select('*');
      if (error) throw error;
      return data;
    },
  });

  // Add Mutation
  const addTenant = useMutation({
    mutationFn: async (tenant: TenantInsert) => {
      const { data, error } = await supabase
        .from('tenants')
        .insert(tenant)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenants'] });
      toast({ title: 'تمت الإضافة بنجاح' });
    },
    onError: (error: Error) => {
      toast({ title: 'خطأ', description: error.message, variant: 'destructive' });
    },
  });

  return {
    tenants,
    isLoading,
    addTenant: addTenant.mutateAsync,
    isAdding: addTenant.isPending,
  };
}
```

---

## 🎨 نظام التصميم

### ❌ لا تستخدم ألوان مباشرة
```tsx
// ❌ خطأ
<div className="bg-blue-500 text-white">
<div className="bg-green-100 text-green-800">

// ✅ صحيح - استخدم tokens النظام
<div className="bg-primary text-primary-foreground">
<div className="bg-status-success/10 text-status-success">
```

### المتغيرات المتاحة (index.css)
```css
/* ألوان أساسية */
--background, --foreground
--primary, --primary-foreground
--secondary, --secondary-foreground
--muted, --muted-foreground
--accent, --accent-foreground
--destructive, --destructive-foreground

/* ألوان الحالة */
--status-success, --status-warning, --status-error, --status-info

/* ألوان الورثة */
--heir-son, --heir-daughter, --heir-wife
```

---

## 🔧 إنشاء Edge Function

### الموقع
```
supabase/functions/{function-name}/index.ts
```

### القالب
```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { data } = await req.json();
    
    // Logic here...

    return new Response(
      JSON.stringify({ success: true, data }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
```

---

## 📊 أفضل الممارسات

### 1. الاستعلامات المتوازية
```typescript
// ❌ خطأ - متتابعة (بطيء)
const tenants = await getTenants();
const properties = await getProperties();
const contracts = await getContracts();

// ✅ صحيح - متوازية (سريع)
const [tenants, properties, contracts] = await Promise.all([
  getTenants(),
  getProperties(),
  getContracts()
]);
```

### 2. Invalidate Queries بشكل محدد
```typescript
// ❌ خطأ - يمسح كل الكاش
queryClient.invalidateQueries();

// ✅ صحيح - يستهدف queries محددة
queryClient.invalidateQueries({ queryKey: ['tenants'] });
queryClient.invalidateQueries({ queryKey: ['tenant-ledger', tenantId] });
```

### 3. استخدام Realtime موحد
```typescript
// ❌ خطأ - قنوات متعددة في كل مكون
useEffect(() => {
  const channel1 = supabase.channel('tenants')...
  const channel2 = supabase.channel('contracts')...
  // ...
}, []);

// ✅ صحيح - قناة موحدة في hook واحد
export function useDashboardRealtime() {
  const queryClient = useQueryClient();
  
  useEffect(() => {
    const channel = supabase
      .channel('dashboard-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tenants' }, 
        () => queryClient.invalidateQueries({ queryKey: ['tenants'] }))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'contracts' }, 
        () => queryClient.invalidateQueries({ queryKey: ['contracts'] }))
      .subscribe();
      
    return () => { supabase.removeChannel(channel); };
  }, [queryClient]);
}
```

### 4. React Hooks Rules
```typescript
// ❌ خطأ - شرط قبل hooks
const MyComponent = ({ userId }) => {
  if (!userId) return null; // ⚠️ خطأ!
  
  const { data } = useQuery(...); // سيفشل
};

// ✅ صحيح - hooks في الأعلى دائماً
const MyComponent = ({ userId }) => {
  const { data, isLoading } = useQuery({
    queryKey: ['user', userId],
    queryFn: () => fetchUser(userId),
    enabled: !!userId, // استخدم enabled بدلاً من الشرط
  });
  
  if (!userId || isLoading) return <Skeleton />;
};
```

---

## 📚 المراجع

- [التوثيق الرسمي](../OFFICIAL_DOCUMENTATION.md)
- [مرجع API](../technical/api-reference.md)
- [هيكل قاعدة البيانات](../technical/database-schema.md)
- [سياسات الأمان](../technical/security-policies.md)

---

**الحالة:** ✅ محدّث | **الإصدار:** 2.6.42
