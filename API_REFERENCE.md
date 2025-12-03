# 📡 مرجع API - منصة إدارة الوقف

## 🔐 المصادقة

### تسجيل الدخول
```typescript
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password'
});
```

### تسجيل الخروج
```typescript
await supabase.auth.signOut();
```

### الحصول على المستخدم الحالي
```typescript
const { data: { user } } = await supabase.auth.getUser();
```

---

## 👥 المستفيدين

### جلب قائمة المستفيدين
```typescript
const { data, error } = await supabase
  .from('beneficiaries')
  .select('*')
  .order('created_at', { ascending: false });
```

### إضافة مستفيد
```typescript
const { data, error } = await supabase
  .from('beneficiaries')
  .insert({
    full_name: 'اسم المستفيد',
    national_id: '1234567890',
    phone: '0501234567',
    category: 'ابن'
  });
```

### تحديث مستفيد
```typescript
const { error } = await supabase
  .from('beneficiaries')
  .update({ phone: '0509876543' })
  .eq('id', beneficiaryId);
```

---

## 💰 المحاسبة

### جلب القيود اليومية
```typescript
const { data, error } = await supabase
  .from('journal_entries')
  .select(`
    *,
    journal_entry_lines (*)
  `)
  .eq('fiscal_year_id', fiscalYearId)
  .order('entry_date', { ascending: false });
```

### إنشاء قيد يومي
```typescript
const { data, error } = await supabase
  .from('journal_entries')
  .insert({
    entry_number: 'JE-2025-000001',
    entry_date: '2025-01-01',
    description: 'وصف القيد',
    fiscal_year_id: fiscalYearId,
    status: 'draft'
  });
```

### جلب شجرة الحسابات
```typescript
const { data, error } = await supabase
  .from('accounts')
  .select('*')
  .order('code');
```

---

## 🏢 العقارات

### جلب العقارات
```typescript
const { data, error } = await supabase
  .from('properties')
  .select(`
    *,
    property_units (count)
  `)
  .order('name');
```

### جلب العقود
```typescript
const { data, error } = await supabase
  .from('contracts')
  .select(`
    *,
    properties (name, address)
  `)
  .eq('status', 'نشط');
```

### تسجيل دفعة إيجار
```typescript
const { data, error } = await supabase
  .from('rental_payments')
  .insert({
    contract_id: contractId,
    amount_due: 5000,
    payment_date: '2025-01-01',
    payment_method: 'تحويل بنكي',
    status: 'مدفوع'
  });
```

---

## 📊 التوزيعات

### جلب التوزيعات
```typescript
const { data, error } = await supabase
  .from('distributions')
  .select(`
    *,
    distribution_details (*),
    distribution_approvals (*)
  `)
  .order('created_at', { ascending: false });
```

### إنشاء توزيع
```typescript
const { data, error } = await supabase
  .from('distributions')
  .insert({
    distribution_number: 'DIST-2025-001',
    fiscal_year_id: fiscalYearId,
    total_amount: 100000,
    status: 'مسودة'
  });
```

### محاكاة التوزيع
```typescript
const { data, error } = await supabase
  .rpc('simulate_distribution', {
    p_total_amount: 100000,
    p_fiscal_year_id: fiscalYearId
  });
```

---

## 🔔 الإشعارات

### جلب الإشعارات
```typescript
const { data, error } = await supabase
  .from('notifications')
  .select('*')
  .eq('user_id', userId)
  .order('created_at', { ascending: false });
```

### إنشاء إشعار
```typescript
await supabase.rpc('create_notification', {
  p_user_id: userId,
  p_title: 'عنوان الإشعار',
  p_message: 'نص الإشعار',
  p_type: 'info'
});
```

### تحديث حالة القراءة
```typescript
await supabase
  .from('notifications')
  .update({ is_read: true })
  .eq('id', notificationId);
```

---

## 💳 القروض

### جلب القروض
```typescript
const { data, error } = await supabase
  .from('loans')
  .select(`
    *,
    loan_installments (*),
    beneficiaries (full_name)
  `)
  .order('created_at', { ascending: false });
```

### إنشاء قرض
```typescript
const { data, error } = await supabase
  .from('loans')
  .insert({
    beneficiary_id: beneficiaryId,
    loan_amount: 10000,
    interest_rate: 0,
    term_months: 12,
    status: 'pending'
  });
```

---

## 📁 الأرشفة

### رفع مستند
```typescript
const { data, error } = await supabase.storage
  .from('documents')
  .upload(`${folderId}/${fileName}`, file);
```

### جلب المستندات
```typescript
const { data, error } = await supabase
  .from('documents')
  .select('*')
  .eq('folder_id', folderId);
```

---

## ⚙️ الإعدادات

### جلب إعدادات النظام
```typescript
const { data, error } = await supabase
  .from('system_settings')
  .select('*')
  .single();
```

### تحديث الإعدادات
```typescript
await supabase
  .from('system_settings')
  .update({ value: newValue })
  .eq('key', settingKey);
```

---

## 🔧 الدوال المخزنة (RPC)

### إنشاء قيد تلقائي
```typescript
const { data, error } = await supabase.rpc('create_auto_journal_entry', {
  p_trigger_event: 'rental_payment',
  p_reference_id: paymentId,
  p_amount: 5000,
  p_description: 'دفعة إيجار'
});
```

### تقييم أهلية المستفيد
```typescript
const { data, error } = await supabase.rpc('auto_assess_eligibility', {
  p_beneficiary_id: beneficiaryId
});
```

### إحصائيات العائلة
```typescript
const { data, error } = await supabase.rpc('get_family_statistics', {
  p_family_id: familyId
});
```

---

## 📊 الاشتراك في التغييرات (Realtime)

### الاستماع للإشعارات
```typescript
const channel = supabase
  .channel('notifications')
  .on(
    'postgres_changes',
    {
      event: 'INSERT',
      schema: 'public',
      table: 'notifications',
      filter: `user_id=eq.${userId}`
    },
    (payload) => {
      console.log('New notification:', payload.new);
    }
  )
  .subscribe();
```

### إلغاء الاشتراك
```typescript
supabase.removeChannel(channel);
```

---

## ⚠️ معالجة الأخطاء

```typescript
try {
  const { data, error } = await supabase
    .from('beneficiaries')
    .select('*');
    
  if (error) {
    console.error('Database error:', error.message);
    throw error;
  }
  
  return data;
} catch (err) {
  // معالجة الخطأ
  productionLogger.error('Failed to fetch beneficiaries', err);
}
```

---

## 🔒 أكواد الحالة

| الكود | المعنى |
|-------|--------|
| `PGRST116` | السجل غير موجود |
| `PGRST301` | خطأ في الاتصال |
| `23505` | قيد مكرر (unique violation) |
| `42501` | رفض الصلاحية (RLS) |
| `23503` | انتهاك المرجع الخارجي |

---

**آخر تحديث:** 2025-12-03
