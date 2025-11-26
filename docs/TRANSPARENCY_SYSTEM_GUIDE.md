# دليل نظام الشفافية - Transparency System Guide

## 🌟 نظرة عامة

نظام **الشفافية** في منصة Waqf Wise يوفر إفصاحاً شاملاً ومفتوحاً عن جميع عمليات الوقف، المعاملات المالية، التوزيعات، والعقارات. الهدف هو بناء الثقة مع المستفيدين والجمهور من خلال الشفافية الكاملة.

---

## 🎯 الأهداف الرئيسية

### 1. **الشفافية المالية**
- إفصاح كامل عن الإيرادات والمصروفات
- تقارير مالية دورية ومفصلة
- كشوفات حسابية واضحة

### 2. **شفافية التوزيعات**
- إظهار قواعد التوزيع بوضوح
- تفاصيل المستفيدين والمبالغ
- تاريخ جميع التوزيعات

### 3. **شفافية العقارات**
- معلومات عن جميع العقارات
- عوائد كل عقار
- تكاليف الصيانة والتطوير

### 4. **المساءلة**
- سجل كامل لجميع العمليات
- تتبع القرارات والموافقات
- إمكانية التدقيق

---

## 📊 مكونات نظام الشفافية

### 1. **الإفصاح السنوي (Annual Disclosure)**

يتم نشر إفصاح سنوي شامل يتضمن:

#### المعلومات المالية:
- **إجمالي الإيرادات**: جميع مصادر الدخل
- **إجمالي المصروفات**: تفصيل كامل للنفقات
- **صافي الدخل**: الفرق بين الإيرادات والمصروفات
- **الأرصدة**: الافتتاحية والختامية

#### تفاصيل المستفيدين:
- **عدد المستفيدين الكلي**
- **عدد الأبناء**
- **عدد البنات**
- **عدد الزوجات**

#### نسب التوزيع:
- **نصيب الناظر**: النسبة والمبلغ
- **نصيب الخيرات**: النسبة والمبلغ
- **نصيب رأس المال**: النسبة والمبلغ

#### المصروفات التفصيلية:
- مصروفات إدارية
- مصروفات صيانة
- مصروفات تطوير
- مصروفات أخرى

### مثال - بنية جدول الإفصاح السنوي:

```sql
CREATE TABLE annual_disclosures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  year INTEGER NOT NULL,
  waqf_name TEXT NOT NULL,
  
  -- البيانات المالية
  total_revenues NUMERIC(15,2) NOT NULL,
  total_expenses NUMERIC(15,2) NOT NULL,
  net_income NUMERIC(15,2) NOT NULL,
  opening_balance NUMERIC(15,2),
  closing_balance NUMERIC(15,2),
  
  -- بيانات المستفيدين
  total_beneficiaries INTEGER NOT NULL DEFAULT 0,
  sons_count INTEGER NOT NULL DEFAULT 0,
  daughters_count INTEGER NOT NULL DEFAULT 0,
  wives_count INTEGER NOT NULL DEFAULT 0,
  beneficiaries_details JSONB,
  
  -- نسب التوزيع
  nazer_percentage NUMERIC(5,2) NOT NULL DEFAULT 10,
  nazer_share NUMERIC(15,2) NOT NULL DEFAULT 0,
  charity_percentage NUMERIC(5,2) NOT NULL DEFAULT 10,
  charity_share NUMERIC(15,2) NOT NULL DEFAULT 0,
  corpus_percentage NUMERIC(5,2) NOT NULL DEFAULT 10,
  corpus_share NUMERIC(15,2) NOT NULL DEFAULT 0,
  
  -- تفصيل المصروفات
  administrative_expenses NUMERIC(15,2),
  maintenance_expenses NUMERIC(15,2),
  development_expenses NUMERIC(15,2),
  other_expenses NUMERIC(15,2),
  expenses_breakdown JSONB,
  
  -- معلومات النشر
  disclosure_date DATE NOT NULL DEFAULT CURRENT_DATE,
  published_at TIMESTAMPTZ,
  published_by UUID,
  status TEXT DEFAULT 'draft',
  
  -- مرفقات
  bank_statement_url TEXT,
  
  -- Audit
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  -- Foreign Keys
  fiscal_year_id UUID REFERENCES fiscal_years(id)
);
```

---

### 2. **لوحة الشفافية العامة (Public Dashboard)**

صفحة عامة متاحة للجميع (بدون تسجيل دخول) تعرض:

#### إحصائيات رئيسية:
```typescript
// src/pages/TransparencyDashboard.tsx

interface TransparencyStats {
  totalRevenue: number;         // إجمالي الإيرادات
  totalDistributed: number;     // إجمالي الموزع
  activeBeneficiaries: number;  // المستفيدون النشطون
  totalProperties: number;      // عدد العقارات
  
  // نسب التوزيع
  distributionRatios: {
    nazer: number;
    charity: number;
    corpus: number;
    beneficiaries: number;
  };
  
  // أحدث توزيع
  latestDistribution: {
    date: string;
    amount: number;
    beneficiariesCount: number;
  };
}
```

#### مخططات بيانية:
- **مخطط الإيرادات**: شهري/سنوي
- **مخطط التوزيعات**: توزيع المبالغ
- **مخطط المصروفات**: تصنيف النفقات
- **مخطط العقارات**: عوائد حسب العقار

#### مكون لوحة الشفافية:
```typescript
// src/components/transparency/PublicDashboard.tsx

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Users, Building, DollarSign } from "lucide-react";

export function PublicDashboard() {
  const { data: stats } = useTransparencyStats();

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">الشفافية المالية</h1>
      
      {/* البطاقات الإحصائية */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-primary" />
              إجمالي الإيرادات
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {stats?.totalRevenue.toLocaleString()} ريال
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              إجمالي الموزع
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {stats?.totalDistributed.toLocaleString()} ريال
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              المستفيدون النشطون
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {stats?.activeBeneficiaries}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5 text-primary" />
              عدد العقارات
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {stats?.totalProperties}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* نسب التوزيع */}
      <Card>
        <CardHeader>
          <CardTitle>نسب التوزيع</CardTitle>
        </CardHeader>
        <CardContent>
          <DistributionRatiosChart data={stats?.distributionRatios} />
        </CardContent>
      </Card>

      {/* المخططات */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>الإيرادات الشهرية</CardTitle>
          </CardHeader>
          <CardContent>
            <RevenueChart />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>المصروفات حسب النوع</CardTitle>
          </CardHeader>
          <CardContent>
            <ExpensesChart />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
```

---

### 3. **إعدادات الشفافية (Transparency Settings)**

نظام مرن للتحكم في ما يتم عرضه للعامة:

```typescript
// src/types/transparency.ts

interface TransparencySettings {
  // عام
  transparency_enabled: boolean;
  public_dashboard_enabled: boolean;
  
  // البيانات المالية
  show_total_revenues: boolean;
  show_total_expenses: boolean;
  show_net_income: boolean;
  show_bank_statements: boolean;
  
  // التوزيعات
  show_distributions: boolean;
  show_beneficiary_names: boolean;  // عرض أسماء المستفيدين
  show_individual_amounts: boolean;  // عرض المبالغ الفردية
  
  // العقارات
  show_properties: boolean;
  show_property_revenues: boolean;
  show_maintenance_costs: boolean;
  
  // التقارير
  show_financial_reports: boolean;
  allow_download_reports: boolean;
  allow_export_pdf: boolean;
  
  // مستويات التفصيل
  detail_level: "basic" | "detailed" | "full";
  
  // الحدود الزمنية
  historical_data_years: number;  // عدد السنوات المتاحة
  
  // التحديث
  auto_update_enabled: boolean;
  update_frequency: "daily" | "weekly" | "monthly";
  
  // Audit
  created_at: string;
  updated_at: string;
  updated_by: string;
}
```

#### جدول الإعدادات:
```sql
CREATE TABLE transparency_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- إعدادات عامة
  transparency_enabled BOOLEAN DEFAULT true,
  public_dashboard_enabled BOOLEAN DEFAULT true,
  
  -- إعدادات البيانات المالية
  show_total_revenues BOOLEAN DEFAULT true,
  show_total_expenses BOOLEAN DEFAULT true,
  show_net_income BOOLEAN DEFAULT true,
  show_bank_statements BOOLEAN DEFAULT false,
  
  -- إعدادات التوزيعات
  show_distributions BOOLEAN DEFAULT true,
  show_beneficiary_names BOOLEAN DEFAULT false,
  show_individual_amounts BOOLEAN DEFAULT false,
  
  -- إعدادات العقارات
  show_properties BOOLEAN DEFAULT true,
  show_property_revenues BOOLEAN DEFAULT true,
  show_maintenance_costs BOOLEAN DEFAULT true,
  
  -- إعدادات التقارير
  show_financial_reports BOOLEAN DEFAULT true,
  allow_download_reports BOOLEAN DEFAULT true,
  allow_export_pdf BOOLEAN DEFAULT true,
  
  -- مستوى التفصيل
  detail_level TEXT DEFAULT 'detailed',
  
  -- حدود زمنية
  historical_data_years INTEGER DEFAULT 5,
  
  -- التحديث
  auto_update_enabled BOOLEAN DEFAULT true,
  update_frequency TEXT DEFAULT 'monthly',
  
  -- Audit
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  updated_by UUID,
  
  -- قيود
  CONSTRAINT detail_level_check CHECK (detail_level IN ('basic', 'detailed', 'full')),
  CONSTRAINT update_frequency_check CHECK (update_frequency IN ('daily', 'weekly', 'monthly'))
);

-- سجل واحد فقط
CREATE UNIQUE INDEX idx_transparency_settings_singleton ON transparency_settings ((true));
```

---

### 4. **التقارير المالية العامة**

تقارير دورية متاحة للتنزيل:

#### أنواع التقارير:
1. **التقرير الشهري**
   - ملخص الإيرادات والمصروفات
   - التوزيعات المنفذة
   - أبرز الأحداث

2. **التقرير الربع سنوي**
   - تحليل الأداء المالي
   - مقارنة بالفترة السابقة
   - التوقعات

3. **التقرير السنوي**
   - إفصاح شامل
   - القوائم المالية الكاملة
   - تقرير الناظر
   - خطط المستقبل

#### مثال - توليد تقرير PDF:
```typescript
// src/lib/reports/transparency-report.ts

import jsPDF from "jspdf";
import "jspdf-autotable";

export const generateAnnualTransparencyReport = async (
  year: number,
  disclosure: AnnualDisclosure
) => {
  const doc = new jsPDF();

  // الصفحة الأولى - الغلاف
  doc.setFontSize(24);
  doc.text(`التقرير السنوي للشفافية ${year}`, 105, 50, { align: "center" });
  doc.setFontSize(16);
  doc.text(disclosure.waqf_name, 105, 70, { align: "center" });

  // الصفحة الثانية - الملخص التنفيذي
  doc.addPage();
  doc.setFontSize(18);
  doc.text("الملخص التنفيذي", 20, 20);
  
  doc.setFontSize(12);
  doc.text(`إجمالي الإيرادات: ${disclosure.total_revenues.toLocaleString()} ريال`, 20, 40);
  doc.text(`إجمالي المصروفات: ${disclosure.total_expenses.toLocaleString()} ريال`, 20, 50);
  doc.text(`صافي الدخل: ${disclosure.net_income.toLocaleString()} ريال`, 20, 60);

  // الصفحة الثالثة - تفاصيل المستفيدين
  doc.addPage();
  doc.setFontSize(18);
  doc.text("المستفيدون", 20, 20);
  
  doc.autoTable({
    startY: 30,
    head: [["الفئة", "العدد", "النسبة"]],
    body: [
      ["الأبناء", disclosure.sons_count, `${(disclosure.sons_count / disclosure.total_beneficiaries * 100).toFixed(1)}%`],
      ["البنات", disclosure.daughters_count, `${(disclosure.daughters_count / disclosure.total_beneficiaries * 100).toFixed(1)}%`],
      ["الزوجات", disclosure.wives_count, `${(disclosure.wives_count / disclosure.total_beneficiaries * 100).toFixed(1)}%`],
      ["الإجمالي", disclosure.total_beneficiaries, "100%"],
    ],
  });

  // الصفحة الرابعة - التوزيعات
  doc.addPage();
  doc.setFontSize(18);
  doc.text("نسب التوزيع", 20, 20);
  
  doc.autoTable({
    startY: 30,
    head: [["البند", "النسبة", "المبلغ"]],
    body: [
      ["نصيب الناظر", `${disclosure.nazer_percentage}%`, `${disclosure.nazer_share.toLocaleString()} ريال`],
      ["نصيب الخيرات", `${disclosure.charity_percentage}%`, `${disclosure.charity_share.toLocaleString()} ريال`],
      ["رأس المال", `${disclosure.corpus_percentage}%`, `${disclosure.corpus_share.toLocaleString()} ريال`],
    ],
  });

  // الصفحة الخامسة - المصروفات
  doc.addPage();
  doc.setFontSize(18);
  doc.text("تفصيل المصروفات", 20, 20);
  
  doc.autoTable({
    startY: 30,
    head: [["نوع المصروف", "المبلغ", "النسبة من الإجمالي"]],
    body: [
      [
        "إدارية",
        `${disclosure.administrative_expenses?.toLocaleString()} ريال`,
        `${((disclosure.administrative_expenses || 0) / disclosure.total_expenses * 100).toFixed(1)}%`
      ],
      [
        "صيانة",
        `${disclosure.maintenance_expenses?.toLocaleString()} ريال`,
        `${((disclosure.maintenance_expenses || 0) / disclosure.total_expenses * 100).toFixed(1)}%`
      ],
      [
        "تطوير",
        `${disclosure.development_expenses?.toLocaleString()} ريال`,
        `${((disclosure.development_expenses || 0) / disclosure.total_expenses * 100).toFixed(1)}%`
      ],
    ],
  });

  // حفظ الملف
  doc.save(`تقرير-الشفافية-${year}.pdf`);
};
```

---

## 🔐 الأمان والخصوصية

### مستويات الخصوصية:

#### 1. **معلومات عامة** (متاحة للجميع)
- إجماليات مالية
- إحصائيات عامة
- نسب التوزيع

#### 2. **معلومات محدودة** (بموافقة)
- أسماء المستفيدين (بدون تفاصيل)
- مواقع العقارات (بدون عناوين دقيقة)

#### 3. **معلومات خاصة** (للمستفيدين فقط)
- المبالغ الفردية
- تفاصيل الحسابات البنكية
- البيانات الشخصية

### RLS Policies للشفافية:

```sql
-- إعدادات الشفافية - قراءة عامة إذا كانت مفعلة
CREATE POLICY "Public can view if enabled"
ON transparency_settings FOR SELECT
USING (transparency_enabled = true);

-- الإفصاحات السنوية - قراءة عامة للمنشورة فقط
CREATE POLICY "Public can view published disclosures"
ON annual_disclosures FOR SELECT
USING (
  status = 'published'
  AND EXISTS (
    SELECT 1 FROM transparency_settings
    WHERE transparency_enabled = true
  )
);

-- الإداريون فقط يمكنهم التعديل
CREATE POLICY "Admins can manage transparency"
ON transparency_settings FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid()
    AND role IN ('admin', 'nazer')
  )
);
```

---

## 📱 واجهات المستخدم

### 1. **صفحة الشفافية العامة**
- **المسار**: `/transparency`
- **الوصول**: عام (بدون تسجيل دخول)
- **المحتوى**: لوحة معلومات + إحصائيات

### 2. **صفحة الإفصاح السنوي**
- **المسار**: `/annual-disclosure/:year`
- **الوصول**: عام
- **المحتوى**: تفاصيل كاملة للسنة

### 3. **إدارة الشفافية** (للمسؤولين)
- **المسار**: `/admin/transparency-settings`
- **الوصول**: Admin/Nazer فقط
- **المحتوى**: إعدادات الشفافية

---

## 🚀 تفعيل نظام الشفافية

### الخطوات:

#### 1. إنشاء إفصاح سنوي
```typescript
const { data, error } = await supabase
  .from("annual_disclosures")
  .insert({
    year: 2025,
    waqf_name: "وقف العائلة",
    total_revenues: 500000,
    total_expenses: 300000,
    net_income: 200000,
    total_beneficiaries: 50,
    sons_count: 20,
    daughters_count: 25,
    wives_count: 5,
    nazer_percentage: 10,
    charity_percentage: 10,
    corpus_percentage: 15,
    status: "draft",
  })
  .select()
  .single();
```

#### 2. مراجعة واعتماد الإفصاح
```typescript
await supabase
  .from("annual_disclosures")
  .update({
    status: "published",
    published_at: new Date().toISOString(),
    published_by: userId,
  })
  .eq("id", disclosureId);
```

#### 3. تفعيل لوحة الشفافية العامة
```typescript
await supabase
  .from("transparency_settings")
  .update({
    transparency_enabled: true,
    public_dashboard_enabled: true,
    show_total_revenues: true,
    show_total_expenses: true,
    show_distributions: true,
  });
```

---

## 📊 المقاييس والتحليلات

### مؤشرات الأداء الرئيسية (KPIs):

1. **معدل الشفافية**: نسبة البيانات المفصح عنها
2. **تفاعل الجمهور**: عدد زيارات صفحة الشفافية
3. **تنزيلات التقارير**: عدد تنزيلات التقارير
4. **رضا المستفيدين**: استطلاعات حول الشفافية

---

## 📚 المراجع

### التوثيق الداخلي:
- [البنية المعمارية](./ARCHITECTURE.md)
- [دليل المطور](./DEVELOPER_GUIDE.md)
- [سياسات RLS](./RLS_POLICIES_DOCUMENTATION.md)

### المعايير والامتثال:
- معايير الإفصاح المالي
- قوانين حماية البيانات (PDPL)
- أفضل ممارسات الحوكمة

---

**آخر تحديث**: 2025
**الإصدار**: 1.0.0
