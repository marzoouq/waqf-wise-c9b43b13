

# خطة إعادة تنظيم تبويبات بوابة المستفيد
## تحليل منهجي مُصحح ومُحقق

---

## التحقق من الوضع الحالي

### الأزرار الخمسة في الشريط السفلي:
| # | الزر | المسار | المحتوى الفعلي |
|---|------|--------|----------------|
| 1 | الرئيسية | `/beneficiary-portal` | `WaqfSummaryTab` - ملخص الوقف والإحصائيات |
| 2 | التوزيعات | `?tab=distributions` | `BeneficiaryDistributionsTab` - كشف حساب + سجل التوزيعات |
| 3 | الطلبات | `?tab=requests` | `BeneficiaryRequestsTab` - طلبات المستفيد |
| 4 | ملفي | `?tab=profile` | `BeneficiaryProfileTab` - بيانات شخصية + **ملخص عائلي (أعداد)** + بنكية |
| 5 | المزيد | `?tab=reports` | `FinancialReportsTab` - تقارير مالية + إفصاحات |

### التبويبات في القائمة الجانبية فقط (غير موجودة في الشريط السفلي):
- `family` → شجرة العائلة (FamilyTreeTab)
- `properties` → العقارات
- `documents` → المستندات
- `governance` → الحوكمة
- `loans` → القروض
- `bank` → الحسابات البنكية

---

## المشاكل المكتشفة بعد التحقق

### المشكلة 1: الخلط بين "ملخص العائلة" و "شجرة العائلة"
**الموقع:** `BeneficiaryProfileTab.tsx` (السطور 307-337)

```text
زر "ملفي" يعرض:
┌─────────────────────────────────┐
│ المعلومات العائلية             │
│ ────────────────────────────── │
│ الحالة الاجتماعية: متزوج       │
│ حجم الأسرة: 5                  │
│ ┌─────┬─────┬─────┐           │
│ │ 2   │ 2   │ 1   │           │
│ │أبناء│بنات │زوجات│           │
│ └─────┴─────┴─────┘           │
└─────────────────────────────────┘
           ↓
    أعداد فقط، بدون أسماء أو تفاصيل
```

**بينما المستخدم يتوقع:**
```text
شجرة العائلة (FamilyTreeTab):
┌─────────────────────────────────┐
│ 👤 محمد أحمد [رب الأسرة] [أنت] │
│ 👤 عبدالله محمد                │
│ 👤 فاطمة محمد                  │
│ ...                            │
└─────────────────────────────────┘
           ↓
    قائمة بالأسماء والتفاصيل
```

### المشكلة 2: زر "المزيد" يفتح صفحة مباشرة بدلاً من قائمة
**الموقع:** `beneficiaryNavigation.ts` (السطر 43)

```typescript
path: "/beneficiary-portal?tab=reports" // يفتح التقارير مباشرة
```

**بينما المتوقع:** قائمة خيارات (عقارات، مستندات، حوكمة، قروض، إعدادات)

---

## خطة الإصلاح

### المرحلة 1: دمج "ملفي" مع "العائلة"

**الهدف:** إنشاء تبويب موحد "العائلة والحساب" يحتوي:
- تبويب فرعي "بياناتي" ← المحتوى الحالي لـ `BeneficiaryProfileTab`
- تبويب فرعي "شجرة العائلة" ← المحتوى الحالي لـ `FamilyTreeTab`
- تبويب فرعي "البنكية" ← قسم المعلومات البنكية

**الملفات المتأثرة:**
1. `src/components/beneficiary/tabs/FamilyAccountTab.tsx` ← **ملف جديد**
2. `src/components/beneficiary/TabRenderer.tsx` ← تحديث
3. `src/config/navigation/beneficiaryNavigation.ts` ← تحديث

**الكود الجديد (`FamilyAccountTab.tsx`):**

```typescript
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, Users, CreditCard } from "lucide-react";
import { BeneficiaryProfileTab } from "./BeneficiaryProfileTab";
import { FamilyTreeTab } from "./FamilyTreeTab";
import { BankAccountsTab } from "./BankAccountsTab";

interface FamilyAccountTabProps {
  beneficiaryId: string;
  beneficiary: unknown;
}

export function FamilyAccountTab({ beneficiaryId, beneficiary }: FamilyAccountTabProps) {
  const [activeSubTab, setActiveSubTab] = useState("profile");

  return (
    <div className="space-y-4">
      <Tabs value={activeSubTab} onValueChange={setActiveSubTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            بياناتي
          </TabsTrigger>
          <TabsTrigger value="family" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            شجرة العائلة
          </TabsTrigger>
          <TabsTrigger value="bank" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            البنكية
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <BeneficiaryProfileTab beneficiary={beneficiary} />
        </TabsContent>

        <TabsContent value="family">
          <FamilyTreeTab beneficiaryId={beneficiaryId} />
        </TabsContent>

        <TabsContent value="bank">
          <BankAccountsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
```

### المرحلة 2: تحويل "المزيد" إلى قائمة

**الهدف:** إنشاء قائمة خيارات بدلاً من فتح التقارير مباشرة

**الملفات المتأثرة:**
1. `src/components/beneficiary/tabs/MoreMenuTab.tsx` ← **ملف جديد**
2. `src/components/beneficiary/TabRenderer.tsx` ← تحديث
3. `src/config/navigation/beneficiaryNavigation.ts` ← تحديث

**الكود الجديد (`MoreMenuTab.tsx`):**

```typescript
import { useNavigate, useSearchParams } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { 
  FileText, Building2, FolderOpen, Scale, 
  CreditCard, Settings, LogOut, ChevronLeft 
} from "lucide-react";
import { useVisibilitySettings } from "@/hooks/governance/useVisibilitySettings";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface MenuItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  tab?: string;
  href?: string;
  action?: () => void;
  settingKey?: string;
}

export function MoreMenuTab() {
  const navigate = useNavigate();
  const [, setSearchParams] = useSearchParams();
  const { settings } = useVisibilitySettings();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success("تم تسجيل الخروج");
    navigate("/auth");
  };

  const menuItems: MenuItem[] = [
    { 
      id: "reports", 
      label: "التقارير والإفصاحات", 
      icon: FileText, 
      tab: "reports-detail",
      settingKey: "show_financial_reports"
    },
    { 
      id: "properties", 
      label: "العقارات", 
      icon: Building2, 
      tab: "properties",
      settingKey: "show_properties"
    },
    { 
      id: "documents", 
      label: "المستندات", 
      icon: FolderOpen, 
      tab: "documents",
      settingKey: "show_documents"
    },
    { 
      id: "governance", 
      label: "الحوكمة", 
      icon: Scale, 
      tab: "governance",
      settingKey: "show_governance"
    },
    { 
      id: "loans", 
      label: "القروض", 
      icon: CreditCard, 
      tab: "loans",
      settingKey: "show_own_loans"
    },
    { 
      id: "settings", 
      label: "الإعدادات", 
      icon: Settings, 
      href: "/beneficiary-settings"
    },
    { 
      id: "logout", 
      label: "تسجيل الخروج", 
      icon: LogOut, 
      action: handleLogout
    },
  ];

  const handleItemClick = (item: MenuItem) => {
    if (item.action) {
      item.action();
    } else if (item.href) {
      navigate(item.href);
    } else if (item.tab) {
      setSearchParams({ tab: item.tab });
    }
  };

  const visibleItems = menuItems.filter(item => {
    if (!item.settingKey) return true;
    return settings?.[item.settingKey as keyof typeof settings];
  });

  return (
    <div className="space-y-2">
      {visibleItems.map((item) => (
        <Card 
          key={item.id}
          className="cursor-pointer hover:bg-accent/50 transition-colors"
          onClick={() => handleItemClick(item)}
        >
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <item.icon className="h-5 w-5 text-primary" />
              </div>
              <span className="font-medium">{item.label}</span>
            </div>
            <ChevronLeft className="h-5 w-5 text-muted-foreground" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
```

### المرحلة 3: تحديث التنقل والإعدادات

**تحديث `beneficiaryNavigation.ts`:**

```typescript
export const beneficiaryNavigationItems: readonly NavigationItem[] = [
  {
    id: "home",
    label: "الرئيسية",
    icon: Home,
    path: "/beneficiary-portal",
    matchPaths: [],
  },
  {
    id: "distributions",
    label: "التوزيعات",
    icon: Wallet,
    path: "/beneficiary-portal?tab=distributions",
    matchPaths: ["/beneficiary-portal?tab=distributions"],
  },
  {
    id: "requests",
    label: "الطلبات",
    icon: FileText,
    path: "/beneficiary-portal?tab=requests",
    matchPaths: ["/beneficiary-portal?tab=requests"],
  },
  {
    id: "family",
    label: "العائلة", // ← تغيير من "ملفي"
    icon: Users, // ← تغيير الأيقونة
    path: "/beneficiary-portal?tab=family-account",
    matchPaths: ["/beneficiary-portal?tab=family-account", "/beneficiary-portal?tab=profile"],
  },
  {
    id: "more",
    label: "المزيد",
    icon: MoreHorizontal,
    path: "/beneficiary-portal?tab=more",
    matchPaths: ["/beneficiary-portal?tab=more"],
  },
] as const;
```

**تحديث `TabRenderer.tsx`:**

إضافة التبويبات الجديدة:

```typescript
const LazyFamilyAccountTab = lazy(() => 
  import("@/components/beneficiary/tabs/FamilyAccountTab").then(m => ({ default: m.FamilyAccountTab }))
);
const LazyMoreMenuTab = lazy(() => 
  import("@/components/beneficiary/tabs/MoreMenuTab").then(m => ({ default: m.MoreMenuTab }))
);

// في TAB_CONFIGS:
{ key: "family-account", settingKey: "show_profile", component: LazyFamilyAccountTab, requiresBeneficiaryId: true, requiresBeneficiary: true },
{ key: "more", settingKey: "show_overview", component: LazyMoreMenuTab, alwaysVisible: true },
// تغيير reports إلى reports-detail للوصول من قائمة "المزيد"
{ key: "reports-detail", settingKey: "show_financial_reports", component: LazyFinancialReportsTab },
```

---

## ملخص التغييرات

| الملف | العملية | الوصف |
|-------|---------|-------|
| `src/components/beneficiary/tabs/FamilyAccountTab.tsx` | **إنشاء** | تبويب مُدمج للعائلة والملف الشخصي |
| `src/components/beneficiary/tabs/MoreMenuTab.tsx` | **إنشاء** | قائمة خيارات "المزيد" |
| `src/components/beneficiary/TabRenderer.tsx` | **تحديث** | إضافة التبويبات الجديدة |
| `src/config/navigation/beneficiaryNavigation.ts` | **تحديث** | تغيير الأزرار |
| `src/components/beneficiary/tabs/index.ts` | **تحديث** | تصدير المكونات الجديدة |

---

## الهيكل النهائي

```text
📱 الشريط السفلي (5 أزرار):
├── 🏠 الرئيسية → WaqfSummaryTab
├── 💰 التوزيعات → BeneficiaryDistributionsTab
├── 📝 الطلبات → BeneficiaryRequestsTab
├── 👨‍👩‍👧‍👦 العائلة → FamilyAccountTab (جديد)
│   ├── بياناتي (BeneficiaryProfileTab)
│   ├── شجرة العائلة (FamilyTreeTab)
│   └── البنكية (BankAccountsTab)
└── ⚙️ المزيد → MoreMenuTab (جديد)
    ├── التقارير والإفصاحات
    ├── العقارات
    ├── المستندات
    ├── الحوكمة
    ├── القروض
    ├── الإعدادات
    └── تسجيل الخروج
```

---

## اختبار الحل

| السيناريو | النتيجة المتوقعة |
|-----------|-----------------|
| الضغط على "العائلة" | تظهر 3 تبويبات فرعية (بياناتي، شجرة العائلة، البنكية) |
| الضغط على "المزيد" | تظهر قائمة خيارات قابلة للنقر |
| اختيار "التقارير" من المزيد | ينتقل إلى صفحة التقارير |
| اختيار "تسجيل الخروج" | يتم تسجيل الخروج والتوجيه لصفحة الدخول |

