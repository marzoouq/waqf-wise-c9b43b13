# نظام الشفافية المتقدم - نظام إدارة الوقف

## 📋 نظرة عامة

تم تطوير نظام شفافية متقدم يسمح للناظر بالتحكم الكامل في البيانات المتاحة لكل من:
- **المستفيدين (beneficiary)**: المستفيدون من الدرجة الأولى (14 مستفيد)
- **الورثة (waqf_heir)**: ورثة الواقف (2 وارث)

كل فئة لديها إعدادات شفافية منفصلة تماماً، مع منح الورثة شفافية كاملة افتراضياً.

---

## 🏗️ البنية التقنية

### 1. قاعدة البيانات

#### جدول `beneficiary_visibility_settings`

```sql
CREATE TABLE beneficiary_visibility_settings (
  id UUID PRIMARY KEY,
  target_role TEXT DEFAULT 'beneficiary' CHECK (target_role IN ('beneficiary', 'waqf_heir')),
  
  -- الأقسام الرئيسية (13)
  show_overview BOOLEAN,
  show_profile BOOLEAN,
  show_requests BOOLEAN,
  show_distributions BOOLEAN,
  show_statements BOOLEAN,
  show_properties BOOLEAN,
  show_documents BOOLEAN,
  show_bank_accounts BOOLEAN,
  show_financial_reports BOOLEAN,
  show_approvals_log BOOLEAN,
  show_disclosures BOOLEAN,
  show_governance BOOLEAN,
  show_budgets BOOLEAN,
  
  -- المستفيدون الآخرون (8)
  show_other_beneficiaries_names BOOLEAN,
  show_other_beneficiaries_amounts BOOLEAN,
  show_other_beneficiaries_personal_data BOOLEAN,
  show_family_tree BOOLEAN,
  show_total_beneficiaries_count BOOLEAN,
  show_beneficiary_categories BOOLEAN,
  show_beneficiaries_statistics BOOLEAN,
  show_inactive_beneficiaries BOOLEAN,
  
  -- البيانات الحساسة (5) - إخفاء جزئي
  mask_iban BOOLEAN,
  mask_phone_numbers BOOLEAN,
  mask_exact_amounts BOOLEAN,
  mask_tenant_info BOOLEAN,
  mask_national_ids BOOLEAN,
  
  -- الجداول المالية (8)
  show_bank_balances BOOLEAN,
  show_bank_transactions BOOLEAN,
  show_bank_statements BOOLEAN,
  show_invoices BOOLEAN,
  show_contracts_details BOOLEAN,
  show_maintenance_costs BOOLEAN,
  show_property_revenues BOOLEAN,
  show_expenses_breakdown BOOLEAN,
  
  -- الحوكمة والقرارات (6)
  show_governance_meetings BOOLEAN,
  show_nazer_decisions BOOLEAN,
  show_policy_changes BOOLEAN,
  show_strategic_plans BOOLEAN,
  show_audit_reports BOOLEAN,
  show_compliance_reports BOOLEAN,
  
  -- القروض والفزعات (5)
  show_own_loans BOOLEAN,
  show_other_loans BOOLEAN,
  mask_loan_amounts BOOLEAN,
  show_emergency_aid BOOLEAN,
  show_emergency_statistics BOOLEAN,
  
  -- الميزانيات والتخطيط (4)
  show_annual_budget BOOLEAN,
  show_budget_execution BOOLEAN,
  show_reserve_funds BOOLEAN,
  show_investment_plans BOOLEAN,
  
  -- المحاسبة التفصيلية (3)
  show_journal_entries BOOLEAN,
  show_trial_balance BOOLEAN,
  show_ledger_details BOOLEAN,
  
  -- التواصل والدعم (2)
  show_internal_messages BOOLEAN,
  show_support_tickets BOOLEAN,
  
  -- الإعدادات العامة (2)
  allow_export_pdf BOOLEAN,
  allow_print BOOLEAN,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**إجمالي الصلاحيات:** 50+ إعداد قابل للتخصيص

---

### 2. سياسات RLS المحدثة

تم منح الورثة (waqf_heir) وصول كامل للبيانات التالية:

```sql
-- العقود: الوارث يرى كل العقود بتفاصيلها
CREATE POLICY "staff_and_heirs_view_contracts"
ON contracts FOR SELECT
USING (is_staff() OR is_waqf_heir());

-- دفعات الإيجار: الوارث يرى كل الدفعات
CREATE POLICY "staff_and_heirs_view_rental_payments"
ON rental_payments FOR SELECT
USING (is_staff() OR is_waqf_heir());

-- الفواتير: الوارث يرى كل الفواتير
CREATE POLICY "staff_and_heirs_view_invoices"
ON invoices FOR SELECT
USING (is_staff() OR is_waqf_heir());

-- الحسابات البنكية: الوارث يرى الأرصدة الكاملة
CREATE POLICY "staff_and_heirs_view_bank_accounts"
ON bank_accounts FOR SELECT
USING (is_staff() OR is_waqf_heir());

-- القيود المحاسبية: الوارث يرى كل القيود
CREATE POLICY "staff_and_heirs_view_journal_entries"
ON journal_entries FOR SELECT
USING (is_staff() OR is_waqf_heir());

-- التوزيعات: الوارث يرى كل التوزيعات
CREATE POLICY "staff_and_heirs_view_all_distributions"
ON distributions FOR SELECT
USING (is_staff() OR is_waqf_heir());
```

---

## 💻 التطبيق البرمجي

### 1. Hook: `useVisibilitySettings`

**الموقع:** `src/hooks/useVisibilitySettings.ts`

```typescript
export function useVisibilitySettings(targetRole?: 'beneficiary' | 'waqf_heir') {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { isWaqfHeir } = useUserRole();
  
  // تحديد الدور المستهدف تلقائياً
  const effectiveRole = targetRole || (isWaqfHeir ? 'waqf_heir' : 'beneficiary');

  // جلب الإعدادات حسب الدور
  const { data: settings, isLoading } = useQuery({
    queryKey: ["visibility-settings", effectiveRole],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("beneficiary_visibility_settings")
        .select("*")
        .eq('target_role', effectiveRole)
        .maybeSingle();
      
      // ... باقي الكود
    }
  });
  
  // ...
}
```

**المميزات:**
- ✅ جلب تلقائي للإعدادات حسب دور المستخدم
- ✅ دعم تمرير الدور يدوياً (للناظر عند الإدارة)
- ✅ إنشاء تلقائي للإعدادات الافتراضية

---

### 2. صفحة إعدادات الشفافية

**الموقع:** `src/pages/TransparencySettings.tsx`

**الوصول:** فقط للناظر (nazer) والمشرف (admin)

**المميزات:**
- 🎛️ **تبويبين منفصلين:**
  - تبويب "المستفيدون" (beneficiary)
  - تبويب "الورثة" (waqf_heir)

- 📊 **8 فئات من الإعدادات:**
  1. الأقسام الرئيسية (13 صلاحية)
  2. الجداول المالية (8 صلاحيات)
  3. بيانات المستفيدين الآخرين (8 صلاحيات)
  4. البيانات الحساسة والإخفاء (5 صلاحيات + 2 عامة)
  5. الحوكمة والقرارات (6 صلاحيات)
  6. القروض والفزعات (5 صلاحيات)
  7. الميزانيات والتخطيط (4 صلاحيات)
  8. المحاسبة التفصيلية (3 صلاحيات)

**التبديل بين الأدوار:**
```tsx
<Button
  variant={activeRole === 'beneficiary' ? 'default' : 'outline'}
  onClick={() => setActiveRole('beneficiary')}
>
  المستفيدون
</Button>
<Button
  variant={activeRole === 'waqf_heir' ? 'default' : 'outline'}
  onClick={() => setActiveRole('waqf_heir')}
>
  الورثة
</Button>
```

---

### 3. بوابة المستفيدين

**الموقع:** `src/pages/BeneficiaryPortal.tsx`

**تطبيق إعدادات الشفافية:**

```tsx
// التحقق من السماح بالوصول
{activeTab === "profile" && settings?.show_profile && (
  <BeneficiaryProfileTab beneficiary={beneficiary} />
)}

// عرض رسالة "غير مصرح" عند عدم السماح
{activeTab === "profile" && !settings?.show_profile && (
  <Alert>
    <Lock className="h-4 w-4" />
    <AlertDescription>غير مصرح لك بالوصول لهذا القسم</AlertDescription>
  </Alert>
)}
```

---

### 4. القائمة الجانبية

**الموقع:** `src/components/beneficiary/BeneficiarySidebar.tsx`

**التصفية التلقائية:**

```typescript
// تصفية العناصر حسب إعدادات الشفافية
const visibleItems = sidebarItems.filter((item) => {
  // العناصر بدون visibilityKey تظهر دائماً
  if (!item.visibilityKey) return true;
  // التحقق من إعدادات الشفافية
  return settings?.[item.visibilityKey] === true;
});
```

**العناصر مع مفاتيح الشفافية:**
```typescript
const sidebarItems: SidebarItem[] = [
  { id: "overview", label: "نظرة عامة", icon: TrendingUp, tab: "overview", visibilityKey: "show_overview" },
  { id: "profile", label: "الملف الشخصي", icon: User, tab: "profile", visibilityKey: "show_profile" },
  { id: "distributions", label: "التوزيعات", icon: DollarSign, tab: "distributions", visibilityKey: "show_distributions" },
  // ...
];
```

---

## 🔐 الإعدادات الافتراضية

### للمستفيدين (beneficiary)

```typescript
{
  target_role: 'beneficiary',
  // الأقسام الأساسية: مفعلة
  show_overview: true,
  show_profile: true,
  show_requests: true,
  show_distributions: true,
  show_statements: true,
  show_properties: true,
  
  // بيانات المستفيدين الآخرين: مخفية
  show_other_beneficiaries_names: false,
  show_other_beneficiaries_amounts: false,
  show_other_beneficiaries_personal_data: false,
  
  // الإخفاء الجزئي: مفعل
  mask_iban: true,
  mask_phone_numbers: true,
  mask_tenant_info: true,
  mask_national_ids: true,
  
  // المحاسبة التفصيلية: مخفية
  show_journal_entries: false,
  show_trial_balance: false,
  show_ledger_details: false,
  
  // باقي الإعدادات: حسب السياق
}
```

### للورثة (waqf_heir)

```typescript
{
  target_role: 'waqf_heir',
  // ✅ كل شيء مفعل (شفافية 100%)
  show_overview: true,
  show_profile: true,
  show_requests: true,
  show_distributions: true,
  show_statements: true,
  show_properties: true,
  show_documents: true,
  show_bank_accounts: true,
  show_financial_reports: true,
  show_approvals_log: true,
  show_disclosures: true,
  show_governance: true,
  show_budgets: true,
  
  show_other_beneficiaries_names: true,
  show_other_beneficiaries_amounts: true,
  show_other_beneficiaries_personal_data: true,
  show_family_tree: true,
  show_total_beneficiaries_count: true,
  show_beneficiary_categories: true,
  show_beneficiaries_statistics: true,
  show_inactive_beneficiaries: true,
  
  // ❌ لا إخفاء (شفافية كاملة)
  mask_iban: false,
  mask_phone_numbers: false,
  mask_exact_amounts: false,
  mask_tenant_info: false,
  mask_national_ids: false,
  
  show_bank_balances: true,
  show_bank_transactions: true,
  show_bank_statements: true,
  show_invoices: true,
  show_contracts_details: true,
  show_maintenance_costs: true,
  show_property_revenues: true,
  show_expenses_breakdown: true,
  
  show_governance_meetings: true,
  show_nazer_decisions: true,
  show_policy_changes: true,
  show_strategic_plans: true,
  show_audit_reports: true,
  show_compliance_reports: true,
  
  show_own_loans: true,
  show_other_loans: true,
  mask_loan_amounts: false,
  show_emergency_aid: true,
  show_emergency_statistics: true,
  
  show_annual_budget: true,
  show_budget_execution: true,
  show_reserve_funds: true,
  show_investment_plans: true,
  
  show_journal_entries: true,
  show_trial_balance: true,
  show_ledger_details: true,
  
  show_internal_messages: true,
  show_support_tickets: true,
  
  allow_export_pdf: true,
  allow_print: true,
}
```

---

## 📊 مقارنة الصلاحيات

| الفئة | المستفيد (beneficiary) | الوارث (waqf_heir) |
|------|----------------------|-------------------|
| **الأقسام الأساسية** | ✅ معظمها مفعل | ✅ كل شيء مفعل |
| **بيانات المستفيدين الآخرين** | ❌ مخفية | ✅ مرئية بالكامل |
| **الإخفاء الجزئي** | ✅ مفعل (IBAN، هواتف...) | ❌ لا إخفاء |
| **الجداول المالية** | ⚠️ جزئي | ✅ كل شيء |
| **المحاسبة التفصيلية** | ❌ مخفية | ✅ مرئية بالكامل |
| **القيود المحاسبية** | ❌ غير متاح | ✅ متاح |
| **العقود والإيجارات** | ⚠️ محدود | ✅ كامل |
| **الفواتير** | ⚠️ محدود | ✅ كل الفواتير |
| **الحسابات البنكية** | ⚠️ محدود | ✅ كل الحسابات |

---

## 🎯 حالات الاستخدام

### 1. الناظر يريد إخفاء الحسابات البنكية عن المستفيدين

**الخطوات:**
1. الذهاب إلى `/transparency-settings`
2. اختيار تبويب "المستفيدون"
3. الذهاب لفئة "الجداول المالية"
4. إيقاف تفعيل "الحسابات البنكية"
5. حفظ الإعدادات

**النتيجة:**
- ❌ المستفيدون لا يرون تبويب "الحسابات البنكية" في القائمة الجانبية
- ❌ لا يمكنهم الوصول للصفحة حتى بالرابط المباشر
- ✅ الورثة لا يزالون يرون كل شيء

---

### 2. الناظر يريد منع الوارث من رؤية القيود المحاسبية

**الخطوات:**
1. الذهاب إلى `/transparency-settings`
2. اختيار تبويب "الورثة"
3. الذهاب لفئة "المحاسبة التفصيلية"
4. إيقاف تفعيل "القيود المحاسبية"
5. حفظ الإعدادات

**النتيجة:**
- ❌ الوارث لا يرى القيود المحاسبية
- ✅ باقي البيانات المالية متاحة
- ✅ الموظفون والناظر لا يتأثرون

---

### 3. عرض أسماء المستفيدين الآخرين فقط (بدون مبالغ)

**الخطوات:**
1. الذهاب إلى `/transparency-settings`
2. اختيار تبويب "المستفيدون"
3. الذهاب لفئة "المستفيدون الآخرون"
4. تفعيل "أسماء المستفيدين"
5. إيقاف "مبالغ المستفيدين"
6. حفظ

**النتيجة:**
- ✅ المستفيد يرى أسماء الآخرين
- ❌ لا يرى المبالغ المصروفة لهم
- ✅ شفافية جزئية

---

## 🚀 التطوير المستقبلي

### إمكانيات إضافية مقترحة:

1. **إعدادات على مستوى المستفيد الفردي**
   - السماح بتخصيص الشفافية لكل مستفيد على حدة
   - مثال: المستفيد "أحمد" يرى كل شيء، "محمد" يرى محدود

2. **جدولة الشفافية**
   - السماح بتفعيل/إيقاف إعدادات معينة في أوقات محددة
   - مثال: إظهار الميزانيات في نهاية السنة فقط

3. **سجل تغييرات الشفافية**
   - تتبع من غيّر أي إعداد ومتى
   - Audit trail كامل لجميع التعديلات

4. **إعدادات شفافية ديناميكية**
   - تفعيل/إيقاف حسب شروط معينة
   - مثال: إخفاء البيانات المالية إذا كان هناك قروض معلقة

5. **قوالب شفافية جاهزة**
   - قالب "شفافية كاملة"
   - قالب "شفافية محدودة"
   - قالب "شفافية متوسطة"

---

## 🔧 الصيانة والاستكشاف

### مشاكل شائعة وحلولها:

#### 1. المستفيد يرى محتوى رغم إيقافه

**السبب:** Cache في المتصفح

**الحل:**
```typescript
// في useVisibilitySettings
queryClient.invalidateQueries({ queryKey: ["visibility-settings"] });
```

#### 2. الإعدادات لا تحفظ

**السبب:** مشكلة في RLS policies

**الحل:**
```sql
-- التحقق من سياسات التحديث
SELECT * FROM pg_policies 
WHERE tablename = 'beneficiary_visibility_settings';
```

#### 3. الوارث لا يرى العقود رغم السياسات

**السبب:** دالة `is_waqf_heir()` لا تعمل

**الحل:**
```sql
-- التحقق من الدالة
SELECT is_waqf_heir();

-- إعادة إنشائها إذا لزم
CREATE OR REPLACE FUNCTION is_waqf_heir()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid()
    AND role = 'waqf_heir'
  )
$$ LANGUAGE SQL STABLE SECURITY DEFINER;
```

---

## 📝 الخلاصة

تم بناء نظام شفافية متقدم يوفر:
- ✅ **50+ إعداد قابل للتخصيص**
- ✅ **إعدادات منفصلة للمستفيدين والورثة**
- ✅ **شفافية كاملة افتراضية للورثة**
- ✅ **تحكم كامل للناظر في الإعدادات**
- ✅ **حماية كاملة على مستوى RLS**
- ✅ **واجهة سهلة الاستخدام للإدارة**
- ✅ **تطبيق تلقائي على البوابة والقوائم**

النظام جاهز للإنتاج ومتوافق مع جميع متطلبات الشفافية والخصوصية.
