# دليل المطور - نظام إدارة الوقف الإلكتروني

## 🎯 مرحباً بك في فريق التطوير!

هذا الدليل الشامل لمساعدتك على البدء في تطوير منصة **Waqf Wise**.

---

## 🚀 الإعداد والتثبيت

### المتطلبات الأساسية
```bash
# Node.js >= 18
node --version

# npm أو yarn أو bun
npm --version
```

### خطوات التثبيت

#### 1. استنساخ المشروع
```bash
git clone https://github.com/marzoouq/waqf-wise-371202c8.git
cd waqf-wise-371202c8
```

#### 2. تثبيت الحزم
```bash
# باستخدام npm
npm install

# أو باستخدام bun (أسرع)
bun install
```

#### 3. إعداد البيئة
الملف `.env` يتم إنشاؤه تلقائياً من Lovable Cloud ويحتوي على:
```env
VITE_SUPABASE_URL=https://zsacuvrcohmraoldilph.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGci...
VITE_SUPABASE_PROJECT_ID=zsacuvrcohmraoldilph
```

⚠️ **تحذير**: لا تعدّل ملف `.env` يدوياً، يتم تحديثه تلقائياً.

#### 4. تشغيل المشروع
```bash
# بيئة التطوير
npm run dev

# أو
bun run dev
```

المشروع سيعمل على: `http://localhost:8080`

---

## 📁 هيكل المشروع بالتفصيل

```
src/
├── components/              # مكونات React
│   ├── ui/                 # مكونات Shadcn UI الأساسية (40+ مكون)
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   ├── form.tsx
│   │   └── ...
│   │
│   ├── layout/             # مكونات التخطيط
│   │   ├── Sidebar.tsx
│   │   ├── Header.tsx
│   │   ├── MobileOptimizedLayout.tsx
│   │   └── MainLayout.tsx
│   │
│   ├── shared/             # مكونات مشتركة
│   │   ├── PageErrorBoundary.tsx
│   │   ├── DataTable.tsx
│   │   ├── FilterBar.tsx
│   │   └── ...
│   │
│   ├── accounting/         # مكونات المحاسبة
│   │   ├── JournalEntryForm.tsx
│   │   ├── AccountsTree.tsx
│   │   ├── TrialBalance.tsx
│   │   └── ...
│   │
│   ├── beneficiary/        # مكونات المستفيدين
│   │   ├── BeneficiaryForm.tsx
│   │   ├── BeneficiaryCard.tsx
│   │   ├── ActivityLog.tsx
│   │   └── ...
│   │
│   ├── properties/         # مكونات العقارات
│   │   ├── PropertyForm.tsx
│   │   ├── PropertyCard.tsx
│   │   ├── MaintenanceSchedule.tsx
│   │   └── ...
│   │
│   ├── distributions/      # مكونات التوزيعات
│   │   ├── DistributionForm.tsx
│   │   ├── SimulationResults.tsx
│   │   ├── PaymentVoucher.tsx
│   │   └── ...
│   │
│   └── ...                 # 38+ مجلد مكونات أخرى
│
├── pages/                  # صفحات التطبيق (72 صفحة)
│   ├── Index.tsx           # الصفحة الرئيسية
│   ├── Dashboard.tsx       # لوحة التحكم
│   ├── Login.tsx           # تسجيل الدخول
│   ├── Beneficiaries.tsx   # قائمة المستفيدين
│   ├── BeneficiaryDetails.tsx
│   ├── BeneficiaryPortal.tsx
│   ├── Properties.tsx
│   ├── PropertyDetails.tsx
│   ├── Accounting.tsx
│   ├── JournalEntries.tsx
│   ├── Accounts.tsx
│   ├── FiscalYears.tsx
│   ├── Distributions.tsx
│   ├── Funds.tsx
│   ├── Reports.tsx
│   └── ...
│
├── hooks/                  # Custom Hooks
│   ├── useBeneficiaries.ts
│   ├── useAccounting.ts
│   ├── useProperties.ts
│   ├── useDistributions.ts
│   ├── useFunds.ts
│   └── ...
│
├── integrations/
│   └── supabase/
│       ├── client.ts       # ⚠️ Auto-generated - لا تعدل
│       └── types.ts        # ⚠️ Auto-generated - لا تعدل
│
├── lib/
│   └── utils.ts            # دوال مساعدة عامة
│
├── App.tsx                 # مكون التطبيق الرئيسي
├── main.tsx                # نقطة الدخول
└── index.css               # الأنماط العامة + Design Tokens
```

---

## 🏗️ أنماط التطوير

### 1. **إنشاء مكون جديد**

#### قاعدة التسمية:
- PascalCase للمكونات: `BeneficiaryCard.tsx`
- camelCase للملفات الأخرى: `useBeneficiaries.ts`
- kebab-case للمجلدات: `beneficiary-portal`

#### مثال: إنشاء مكون بطاقة مستفيد
```typescript
// src/components/beneficiary/BeneficiaryCard.tsx

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { User } from "lucide-react";

interface BeneficiaryCardProps {
  beneficiary: {
    id: string;
    full_name: string;
    status: string;
    total_received: number;
  };
  onView?: (id: string) => void;
}

export function BeneficiaryCard({ beneficiary, onView }: BeneficiaryCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5 text-primary" />
          {beneficiary.full_name}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <Badge variant={beneficiary.status === "active" ? "default" : "secondary"}>
            {beneficiary.status}
          </Badge>
          <p className="text-sm text-muted-foreground">
            إجمالي المدفوعات: {beneficiary.total_received} ريال
          </p>
          <Button onClick={() => onView?.(beneficiary.id)} className="w-full">
            عرض التفاصيل
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
```

### 2. **إنشاء Custom Hook**

#### مثال: Hook لجلب المستفيدين
```typescript
// src/hooks/useBeneficiaries.ts

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useBeneficiaries = () => {
  return useQuery({
    queryKey: ["beneficiaries"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("beneficiaries")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });
};

export const useAddBeneficiary = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (beneficiary: any) => {
      const { data, error } = await supabase
        .from("beneficiaries")
        .insert(beneficiary)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["beneficiaries"] });
      toast.success("تمت إضافة المستفيد بنجاح");
    },
    onError: (error) => {
      toast.error("فشل في إضافة المستفيد");
      console.error("Error adding beneficiary:", error);
    },
  });
};

export const useUpdateBeneficiary = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: any }) => {
      const { data, error } = await supabase
        .from("beneficiaries")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["beneficiaries"] });
      toast.success("تم تحديث البيانات بنجاح");
    },
    onError: (error) => {
      toast.error("فشل في تحديث البيانات");
      console.error("Error updating beneficiary:", error);
    },
  });
};
```

### 3. **إنشاء صفحة جديدة**

```typescript
// src/pages/NewFeaturePage.tsx

import { MobileOptimizedLayout, MobileOptimizedHeader } from "@/components/layout/MobileOptimizedLayout";
import { PageErrorBoundary } from "@/components/shared/PageErrorBoundary";
import { Card, CardContent } from "@/components/ui/card";
import { Sparkles } from "lucide-react";

const NewFeaturePage = () => {
  return (
    <PageErrorBoundary pageName="الميزة الجديدة">
      <MobileOptimizedLayout>
        <MobileOptimizedHeader
          title="الميزة الجديدة"
          description="وصف الميزة"
          icon={<Sparkles className="h-8 w-8 text-primary" />}
        />
        
        <Card>
          <CardContent className="p-6">
            {/* محتوى الصفحة */}
          </CardContent>
        </Card>
      </MobileOptimizedLayout>
    </PageErrorBoundary>
  );
};

export default NewFeaturePage;
```

ثم أضف المسار في `App.tsx`:
```typescript
import NewFeaturePage from "@/pages/NewFeaturePage";

// في المسارات:
<Route path="/new-feature" element={<NewFeaturePage />} />
```

---

## 🎨 نظام التصميم

### استخدام Design Tokens

**✅ الطريقة الصحيحة:**
```tsx
// استخدام semantic tokens من index.css
<div className="bg-primary text-primary-foreground">
  محتوى
</div>

<button className="bg-secondary hover:bg-secondary/80">
  زر
</button>
```

**❌ الطريقة الخاطئة:**
```tsx
// لا تستخدم ألوان مباشرة
<div className="bg-blue-500 text-white">
  محتوى
</div>
```

### الألوان المتاحة (من index.css):
```css
--background         /* خلفية الصفحة */
--foreground         /* نص على الخلفية */
--primary            /* اللون الأساسي */
--primary-foreground /* نص على الأساسي */
--secondary          /* اللون الثانوي */
--secondary-foreground
--muted              /* ألوان خافتة */
--muted-foreground
--accent             /* لون التمييز */
--accent-foreground
--destructive        /* ألوان التحذير */
--destructive-foreground
--border             /* حدود */
--input              /* حقول الإدخال */
--ring               /* إطار التركيز */
```

### الاستخدام الصحيح في Tailwind:
```tsx
<Card className="border-border bg-card">
  <CardHeader className="bg-muted/50">
    <CardTitle className="text-foreground">عنوان</CardTitle>
  </CardHeader>
  <CardContent>
    <p className="text-muted-foreground">نص</p>
  </CardContent>
</Card>
```

---

## 🗄️ العمل مع قاعدة البيانات

### استخدام Supabase Client

#### ✅ الطريقة الصحيحة:
```typescript
import { supabase } from "@/integrations/supabase/client";

// جلب بيانات
const { data, error } = await supabase
  .from("beneficiaries")
  .select("*")
  .eq("status", "active")
  .order("created_at", { ascending: false });

// إدراج بيانات
const { data, error } = await supabase
  .from("beneficiaries")
  .insert({
    full_name: "أحمد محمد",
    national_id: "1234567890",
    phone: "0512345678",
    category: "أبناء",
    status: "active",
  })
  .select()
  .single();

// تحديث بيانات
const { data, error } = await supabase
  .from("beneficiaries")
  .update({ status: "inactive" })
  .eq("id", beneficiaryId)
  .select()
  .single();

// حذف بيانات
const { error } = await supabase
  .from("beneficiaries")
  .delete()
  .eq("id", beneficiaryId);
```

#### ⚠️ تنبيهات مهمة:
1. **لا تعدل** ملفات `client.ts` و `types.ts` - يتم توليدها تلقائياً
2. **استخدم RLS Policies** - جميع الجداول محمية بسياسات RLS
3. **معالجة الأخطاء** - تحقق دائماً من `error` قبل استخدام `data`

### استخدام Realtime

```typescript
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";

const channel = supabase
  .channel("beneficiary-changes")
  .on(
    "postgres_changes",
    {
      event: "*",
      schema: "public",
      table: "beneficiaries",
    },
    (payload) => {
      console.log("Change received!", payload);
      // تحديث الواجهة
    }
  )
  .subscribe();

// تنظيف عند إلغاء التحميل
useEffect(() => {
  return () => {
    supabase.removeChannel(channel);
  };
}, []);
```

---

## 📝 تعديلات قاعدة البيانات (Migrations)

### إنشاء Migration جديد

**⚠️ مهم**: استخدم أدوات Lovable لإنشاء migrations، لا تنشئها يدوياً.

#### مثال: إضافة عمود جديد
عند الحاجة لإضافة عمود جديد، اطلب من Lovable:
> "أريد إضافة عمود `priority_score` نوع number إلى جدول beneficiaries"

سيقوم Lovable بإنشاء migration تلقائياً مثل:
```sql
-- في supabase/migrations/[timestamp]_add_priority_score.sql
ALTER TABLE beneficiaries 
ADD COLUMN priority_score INTEGER DEFAULT 0;

-- تحديث RLS policies إذا لزم الأمر
```

#### مثال: إنشاء جدول جديد
```sql
-- Migration تلقائي من Lovable
CREATE TABLE new_feature_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  beneficiary_id UUID REFERENCES beneficiaries(id) ON DELETE CASCADE,
  data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- فهرسة للأداء
CREATE INDEX idx_new_feature_beneficiary ON new_feature_data(beneficiary_id);

-- RLS Policies
ALTER TABLE new_feature_data ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own data"
ON new_feature_data FOR SELECT
USING (auth.uid() IN (
  SELECT user_id FROM beneficiaries WHERE id = new_feature_data.beneficiary_id
));
```

---

## 🔐 الأمان وسياسات RLS

### فهم Row Level Security (RLS)

كل جدول في قاعدة البيانات محمي بسياسات RLS التي تحدد من يمكنه:
- **SELECT**: قراءة البيانات
- **INSERT**: إضافة بيانات جديدة
- **UPDATE**: تحديث البيانات
- **DELETE**: حذف البيانات

### مثال: سياسات جدول beneficiaries
```sql
-- المستخدمون يمكنهم رؤية بياناتهم فقط
CREATE POLICY "Beneficiaries can view own data"
ON beneficiaries FOR SELECT
USING (auth.uid() = user_id);

-- الإداريون يمكنهم رؤية جميع البيانات
CREATE POLICY "Admins can view all"
ON beneficiaries FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid()
    AND role IN ('admin', 'nazer', 'accountant')
  )
);

-- المستخدمون يمكنهم تحديث بياناتهم
CREATE POLICY "Users can update own data"
ON beneficiaries FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);
```

### التحقق من الصلاحيات في الكود

```typescript
// في الواجهة الأمامية
import { supabase } from "@/integrations/supabase/client";

// جلب دور المستخدم الحالي
const { data: session } = await supabase.auth.getSession();
const userId = session?.session?.user?.id;

// جلب الدور
const { data: userRole } = await supabase
  .from("user_roles")
  .select("role")
  .eq("user_id", userId)
  .single();

// فحص الصلاحية
if (userRole?.role !== "admin") {
  toast.error("غير مصرح لك بهذه العملية");
  return;
}
```

**للمزيد من التفاصيل**: راجع [توثيق سياسات RLS](./RLS_POLICIES_DOCUMENTATION.md)

---

## 🧪 الاختبار

### تشغيل الاختبارات

```bash
# اختبارات Vitest
npm run test

# اختبارات E2E مع Playwright
npm run test:e2e

# تغطية الكود
npm run test:coverage
```

### كتابة اختبار لمكون

```typescript
// src/components/beneficiary/__tests__/BeneficiaryCard.test.tsx

import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { BeneficiaryCard } from "../BeneficiaryCard";

describe("BeneficiaryCard", () => {
  const mockBeneficiary = {
    id: "123",
    full_name: "أحمد محمد",
    status: "active",
    total_received: 5000,
  };

  it("should render beneficiary name", () => {
    render(<BeneficiaryCard beneficiary={mockBeneficiary} />);
    expect(screen.getByText("أحمد محمد")).toBeInTheDocument();
  });

  it("should call onView when button clicked", () => {
    const onView = vi.fn();
    render(<BeneficiaryCard beneficiary={mockBeneficiary} onView={onView} />);
    
    const button = screen.getByText("عرض التفاصيل");
    fireEvent.click(button);
    
    expect(onView).toHaveBeenCalledWith("123");
  });
});
```

**للمزيد**: راجع [دليل الاختبار](./TESTING.md)

---

## 🔧 أدوات التطوير المفيدة

### 1. **React Query Devtools**
مفعّلة افتراضياً في بيئة التطوير:
```typescript
// في App.tsx
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

<ReactQueryDevtools initialIsOpen={false} />
```

### 2. **Supabase Dashboard**
الوصول عبر Lovable Cloud:
- عرض الجداول والبيانات
- تنفيذ استعلامات SQL
- مراقبة Logs
- إدارة Storage

### 3. **Browser DevTools**
- **React DevTools**: لفحص المكونات
- **Console**: لمراقبة الأخطاء والتحذيرات
- **Network**: لمراقبة الطلبات

---

## 📋 قائمة التحقق قبل الـ Commit

- [ ] الكود يعمل بدون أخطاء
- [ ] الاختبارات تمر بنجاح
- [ ] لا توجد warnings في Console
- [ ] الكود منسق (Prettier)
- [ ] الكود يتبع ESLint rules
- [ ] التعليقات واضحة (عند الحاجة)
- [ ] التسميات واضحة ودلالية
- [ ] استخدام semantic tokens للألوان
- [ ] معالجة الأخطاء موجودة
- [ ] لا توجد معلومات حساسة في الكود

### تشغيل الفحص التلقائي:
```bash
# تنسيق الكود
npm run format

# فحص ESLint
npm run lint

# تشغيل الاختبارات
npm run test
```

---

## 🐛 استكشاف الأخطاء

### مشاكل شائعة وحلولها:

#### 1. **خطأ في Supabase Client**
```
Error: supabase is not defined
```
**الحل**: تأكد من استيراد client بشكل صحيح:
```typescript
import { supabase } from "@/integrations/supabase/client";
```

#### 2. **خطأ RLS Policy**
```
Error: new row violates row-level security policy
```
**الحل**: تحقق من سياسات RLS للجدول. قد تحتاج صلاحيات إضافية.

#### 3. **خطأ في التسمية**
```
Error: Cannot find module '@/components/...'
```
**الحل**: تأكد من استخدام `@` للإشارة إلى `src/`:
```typescript
import { Button } from "@/components/ui/button";
```

#### 4. **مشاكل في الأداء**
- استخدم React.memo للمكونات الثقيلة
- استخدم useMemo و useCallback للدوال المعقدة
- تحقق من استعلامات Supabase (أضف indexes إذا لزم)

**للمزيد**: راجع [دليل استكشاف الأخطاء](./TROUBLESHOOTING_GUIDE.md)

---

## 🚀 أفضل الممارسات

### 1. **تنظيم الكود**
- مكون واحد لكل ملف
- Hook واحد لكل ملف
- مجلدات منظمة حسب الميزة

### 2. **التسمية**
- أسماء واضحة ودلالية
- تجنب الاختصارات غير الواضحة
- استخدم الأسماء العربية في التعليقات

### 3. **الأداء**
- تجنب re-renders غير الضرورية
- استخدم React Query للـ caching
- استخدم lazy loading للمكونات الكبيرة

### 4. **الأمان**
- لا تكشف معلومات حساسة
- استخدم RLS policies
- تحقق من المدخلات (validation)

### 5. **إمكانية الوصول (Accessibility)**
- استخدم semantic HTML
- أضف aria-labels عند الحاجة
- تأكد من دعم لوحة المفاتيح

---

## 📚 موارد إضافية

### التوثيق الداخلي:
- [البنية المعمارية](./ARCHITECTURE.md)
- [سياسات RLS](./RLS_POLICIES_DOCUMENTATION.md)
- [دليل الاختبار](./TESTING.md)
- [نظام الشفافية](./TRANSPARENCY_SYSTEM_GUIDE.md)

### الموارد الخارجية:
- [React Docs](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Supabase Docs](https://supabase.com/docs)
- [TanStack Query](https://tanstack.com/query/latest)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Shadcn/ui](https://ui.shadcn.com)

---

## 💬 الدعم

إذا واجهت أي مشكلة:
1. راجع [استكشاف الأخطاء](./TROUBLESHOOTING_GUIDE.md)
2. ابحث في Issues على GitHub
3. اسأل الفريق

---

## 🎉 نصائح للنجاح

1. **ابدأ صغيراً**: لا تحاول تعلم كل شيء دفعة واحدة
2. **اقرأ الكود الموجود**: تعلم من الأنماط المستخدمة
3. **اسأل عند الحاجة**: لا تتردد في طلب المساعدة
4. **جرب وتعلم**: أفضل طريقة للتعلم هي التجربة
5. **ساهم بالتوثيق**: إذا تعلمت شيئاً جديداً، وثّقه للآخرين

---

**مرحباً بك في الفريق! 🚀**

آخر تحديث: 2025
