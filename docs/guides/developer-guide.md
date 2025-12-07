# 👨‍💻 دليل المطور | Developer Guide

**الإصدار:** 2.6.32 | **آخر تحديث:** 2025-12-07

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
├── assets/          # الصور والملفات الثابتة
├── components/      # المكونات (~350)
├── hooks/           # Custom Hooks (~152)
├── integrations/    # Supabase client
├── lib/             # المكتبات المساعدة
├── pages/           # الصفحات (~74)
├── routes/          # التوجيه
├── services/        # الخدمات
└── types/           # الأنواع
```

---

## 🎨 معايير الكود

### تسمية الملفات
| النوع | التسمية | مثال |
|-------|---------|------|
| Component | PascalCase.tsx | `BeneficiaryCard.tsx` |
| Hook | useCamelCase.ts | `useBeneficiaries.ts` |
| Utility | camelCase.ts | `exportHelpers.ts` |
| Type | PascalCase.ts | `Beneficiary.ts` |

### هيكل المكون
```tsx
// 1. Imports
import { useState } from 'react';
import { useBeneficiaries } from '@/hooks/beneficiary/useBeneficiaries';

// 2. Types
interface Props {
  id: string;
}

// 3. Component
export const BeneficiaryCard = ({ id }: Props) => {
  // 4. Hooks
  const { data, isLoading } = useBeneficiaries();
  
  // 5. State
  const [isOpen, setIsOpen] = useState(false);
  
  // 6. Handlers
  const handleClick = () => setIsOpen(true);
  
  // 7. Render
  return (
    <div onClick={handleClick}>
      {/* JSX */}
    </div>
  );
};
```

---

## 🪝 إنشاء Hook جديد

### الموقع
```
src/hooks/{category}/use{Name}.ts
```

### القالب
```typescript
import { useQuery, useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useBeneficiaries = () => {
  return useQuery({
    queryKey: ['beneficiaries'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('beneficiaries')
        .select('*');
      
      if (error) throw error;
      return data;
    },
    staleTime: 2 * 60 * 1000, // دقيقتان
  });
};
```

---

## 🎨 نظام التصميم

### استخدام Tailwind Tokens
```tsx
// ❌ خطأ - ألوان مباشرة
<div className="bg-blue-500 text-white">

// ✅ صحيح - tokens من النظام
<div className="bg-primary text-primary-foreground">
```

### المتغيرات المتاحة
```css
--background
--foreground
--primary
--primary-foreground
--secondary
--muted
--accent
--destructive
--border
--ring
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
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // المنطق هنا

    return new Response(
      JSON.stringify({ success: true }),
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
// ❌ خطأ - متتابعة
const beneficiaries = await getBeneficiaries();
const properties = await getProperties();

// ✅ صحيح - متوازية
const [beneficiaries, properties] = await Promise.all([
  getBeneficiaries(),
  getProperties()
]);
```

### 2. التحميل الكسول
```typescript
// استخدام React.lazy
const HeavyComponent = React.lazy(() => import('./HeavyComponent'));
```

### 3. React Query Configuration
```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 2 * 60 * 1000, // دقيقتان
      refetchOnWindowFocus: true,
    },
  },
});
```

---

## 🐛 التصحيح

### قراءة السجلات
```typescript
// Console logs
console.log('Debug:', data);

// Supabase logs
const { data, error } = await supabase.from('table').select();
if (error) console.error('Supabase error:', error);
```

### أدوات التطوير
- React Query DevTools
- Supabase Dashboard
- Browser DevTools

---

## 📚 المراجع

- [التوثيق الرسمي](./OFFICIAL_DOCUMENTATION.md)
- [مرجع API](../technical/api-reference.md)
- [هيكل قاعدة البيانات](../technical/database-schema.md)
- [سياسات الأمان](../technical/security-policies.md)

---

**الحالة:** ✅ محدّث | **الإصدار:** 2.6.32
