# خطة التكامل الشاملة - الجزء المتبقي

## المرحلة 1: اصلاح مشكلة التوجيه بعد تسجيل الدخول (الاولوية القصوى)

### 1.1 المشكلة
عند تسجيل الدخول كمدير، يتم التوجيه اولا الى `/redirect` ثم يعلق المستخدم على شاشة التحميل. بعد تحديث الصفحة يعمل التوجيه بشكل صحيح.

### 1.2 السبب الجذري
1. **LoginLight.tsx** يوجه الى `/redirect` بعد تسجيل الدخول
2. **RoleBasedRedirect.tsx** ينتظر `authLoading` و `rolesLoading` من AuthContext
3. **AuthContext.tsx** يستدعي `fetchUserData` بتأخير عند حدث `SIGNED_IN`
4. هناك سباق بين التوجيه وجلب البيانات

### 1.3 الحل
تحديث **LoginLight.tsx** لجلب الادوار مباشرة بعد تسجيل الدخول والتوجيه للوحة التحكم المناسبة:

```typescript
// بعد نجاح تسجيل الدخول
if (authData?.user) {
  // جلب الادوار مباشرة
  const { data: rolesData } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', authData.user.id);
  
  const roles = rolesData?.map(r => r.role) || [];
  const targetDashboard = getDashboardForRoles(roles as AppRole[]);
  
  navigate(targetDashboard, { replace: true });
}
```

### 1.4 تحديث AuthenticatedRedirect.tsx
تحديث لجلب الادوار مباشرة والتوجيه بدون الاعتماد على AuthContext:

```typescript
const checkAndRedirect = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    navigate('/login', { replace: true });
    return;
  }

  // جلب الادوار مباشرة
  const { data: rolesData } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', session.user.id);
  
  const roles = rolesData?.map(r => r.role) || [];
  const targetDashboard = getDashboardForRoles(roles as AppRole[]);
  
  navigate(targetDashboard, { replace: true });
};
```

### 1.5 تحسين RoleBasedRedirect.tsx
تقليل Timeout من 3 ثواني الى 1 ثانية وتحسين منطق التوجيه:

```typescript
// تقليل Timeout
const timer = setTimeout(() => {
  setLoadingTooLong(true);
}, 1000); // بدلا من 3000

// اذا لم توجد ادوار، جلبها مباشرة من قاعدة البيانات
if (user && roles.length === 0 && !rolesLoading) {
  const { data } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', user.id);
  
  if (data && data.length > 0) {
    const target = getDashboardForRoles(data.map(r => r.role) as AppRole[]);
    return <Navigate to={target} replace />;
  }
}
```

---

## المرحلة 2: توحيد مصادر البيانات المالية

### 2.1 تحديث kpi.service.ts
- اضافة حالة "مؤجر" لحساب العقارات النشطة
- توحيد حساب الوحدات الشاغرة مع العقود النشطة

```typescript
// حساب العقارات النشطة
const activeProperties = properties?.filter(p => 
  p.status === "نشط" || 
  p.status === "active" || 
  p.status === "مؤجر"
).length || 0;

// حساب الوحدات المشغولة من العقود
const occupiedFromContracts = contracts?.filter(c => c.status === 'نشط').length || 0;
const vacantUnits = Math.max(0, totalUnits - occupiedFromContracts);
```

### 2.2 تحديث property-stats.service.ts
مطابقة الحسابات مع kpi.service.ts لضمان الاتساق.

---

## المرحلة 3: انشاء جدول دفعات الايجار

### 3.1 انشاء Function لتوليد الدفعات
```sql
CREATE OR REPLACE FUNCTION regenerate_payment_schedule(p_contract_id UUID)
RETURNS INTEGER AS $$
DECLARE
  v_contract RECORD;
  v_current_date DATE;
  v_count INTEGER := 0;
BEGIN
  SELECT * INTO v_contract FROM contracts WHERE id = p_contract_id;
  
  -- حذف الدفعات القديمة غير المدفوعة
  DELETE FROM rental_payments 
  WHERE contract_id = p_contract_id 
  AND status IN ('pending', 'معلقة');
  
  -- توليد 12 دفعة شهرية
  v_current_date := v_contract.start_date;
  FOR i IN 1..12 LOOP
    INSERT INTO rental_payments (
      contract_id, tenant_id, unit_id, amount, due_date, status
    ) VALUES (
      p_contract_id, v_contract.tenant_id, v_contract.unit_id,
      v_contract.monthly_rent, v_current_date, 'pending'
    );
    v_current_date := v_current_date + INTERVAL '1 month';
    v_count := v_count + 1;
  END LOOP;
  
  RETURN v_count;
END;
$$ LANGUAGE plpgsql;
```

### 3.2 انشاء Trigger للعقود الجديدة
```sql
CREATE OR REPLACE FUNCTION auto_generate_rental_payments()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'نشط' AND (OLD IS NULL OR OLD.status != 'نشط') THEN
    PERFORM regenerate_payment_schedule(NEW.id);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_auto_generate_payments
AFTER INSERT OR UPDATE OF status ON contracts
FOR EACH ROW EXECUTE FUNCTION auto_generate_rental_payments();
```

### 3.3 توليد دفعات العقد الحالي
```sql
SELECT regenerate_payment_schedule('c16a0a08-7bf9-42cc-ad31-a7d27af9c7f9');
```

---

## المرحلة 4: تحسين لوحات التحكم

### 4.1 لوحة المحاسب (AccountantDashboard)
اضافة قسم التحصيل:
- نسبة التحصيل الشهرية
- المبالغ المحصلة vs المتوقعة
- تنبيهات الدفعات المتأخرة

### 4.2 لوحة الصراف (CashierDashboard)
اضافة:
- قائمة الايجارات المستحقة اليوم
- المتأخرات
- ملخص التحصيل اليومي

### 4.3 لوحة الناظر (NazerDashboard)
اضافة:
- تنبيه العقود المنتهية خلال 30 يوم
- تنبيه التحصيل المتأخر
- نظرة عامة على الاداء المالي

---

## المرحلة 5: ربط سندات الصرف بالمستأجرين

### 5.1 تحديث جدول payment_vouchers
```sql
ALTER TABLE payment_vouchers
ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id),
ADD COLUMN IF NOT EXISTS contract_id UUID REFERENCES contracts(id);
```

### 5.2 انشاء Trigger لتحديث دفتر المستأجر
```sql
CREATE OR REPLACE FUNCTION update_tenant_ledger_on_voucher()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.tenant_id IS NOT NULL AND NEW.status = 'مكتمل' THEN
    UPDATE tenant_ledger
    SET balance = balance - NEW.amount
    WHERE tenant_id = NEW.tenant_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

---

## المرحلة 6: اختبار التكامل النهائي

### 6.1 التحقق من الارقام
- الايراد السنوي المتوقع = 16,200 ريال
- المحصل = 0 ريال (حتى الان)
- الوحدات المشغولة = 1
- الوحدات الشاغرة = 0

### 6.2 التحقق من التوجيه
- تسجيل دخول المدير -> مباشرة الى /admin-dashboard
- تسجيل دخول الناظر -> مباشرة الى /nazer-dashboard
- تسجيل دخول المحاسب -> مباشرة الى /accountant-dashboard

### 6.3 التحقق من لوحات التحكم
- جميع اللوحات تعرض نفس الارقام
- التقارير تعمل بشكل صحيح

---

## ملخص التغييرات

| الملف | نوع التغيير | الوصف |
|-------|-------------|-------|
| LoginLight.tsx | تحديث | التوجيه المباشر للوحة التحكم |
| AuthenticatedRedirect.tsx | تحديث | جلب الادوار مباشرة |
| RoleBasedRedirect.tsx | تحديث | تقليل Timeout وتحسين المنطق |
| kpi.service.ts | تحديث | توحيد حسابات العقارات |
| property-stats.service.ts | تحديث | مطابقة الحسابات |
| Migration جديدة | اضافة | Functions و Triggers للدفعات |
| AccountantDashboard.tsx | تحسين | قسم التحصيل |
| CashierDashboard.tsx | تحسين | الايجارات المستحقة |
| NazerDashboard.tsx | تحسين | تنبيهات الاداء |

---

## الوقت المقدر

| المرحلة | الوقت |
|---------|-------|
| اصلاح التوجيه | 20 دقيقة |
| توحيد البيانات | 15 دقيقة |
| جدول الدفعات | 20 دقيقة |
| تحسين اللوحات | 25 دقيقة |
| ربط السندات | 15 دقيقة |
| الاختبار | 10 دقائق |
| **الاجمالي** | **~105 دقيقة** |
