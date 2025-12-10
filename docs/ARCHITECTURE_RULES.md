# قواعد الهيكل المعماري الصارمة
# Strict Architecture Rules

> **الإصدار**: 2.8.74  
> **آخر تحديث**: 2025-12-10

---

## 🚫 القواعد الحرجة - Critical Rules

### 1. منع استخدام `any` نهائياً - No `any` Type EVER

```typescript
// ❌ ممنوع - FORBIDDEN
const data: any = fetchData();
function process(item: any): any { }
Promise<any>

// ✅ صحيح - CORRECT
const data: UserData = fetchData();
function process(item: BeneficiaryItem): ProcessedResult { }
Promise<UserData>
```

**الاستثناءات المسموحة فقط**:
- `eslint-disable-next-line @typescript-eslint/no-explicit-any` مع تبرير واضح
- استخدام `unknown` بدلاً من `any` عند الضرورة

---

### 2. فصل الطبقات المعمارية - Layer Separation

```
Component (UI) → Hook (State) → Service (Data) → Supabase
```

| الطبقة | المسؤولية | ممنوع |
|--------|-----------|-------|
| **Component** | عرض UI فقط | ❌ استدعاء Supabase مباشرة |
| **Hook** | إدارة الحالة + React Query | ❌ استدعاء Supabase (إلا Realtime) |
| **Service** | استعلامات قاعدة البيانات | ❌ استخدام React hooks |

---

### 3. استخدام `.maybeSingle()` بدلاً من `.single()` - Use maybeSingle

```typescript
// ❌ خطر - DANGEROUS (قد يفشل إذا لم يوجد السجل)
const { data } = await supabase.from('users').select('*').eq('id', id).single();

// ✅ آمن - SAFE (يُرجع null إذا لم يوجد)
const { data } = await supabase.from('users').select('*').eq('id', id).maybeSingle();
```

**متى يُسمح بـ `.single()`**:
- مع `insert().select().single()` - آمن (الـ insert يُرجع دائماً صف)
- مع `update().eq().select().single()` - آمن نسبياً

---

### 4. التسميات والأنواع - Naming & Types

```typescript
// ✅ كل دالة يجب أن تحدد نوع الإرجاع
static async getUsers(): Promise<User[]> { }

// ✅ كل معامل يجب أن يحدد نوعه
function updateUser(id: string, data: UserUpdate): Promise<void> { }

// ✅ استخدام interfaces للكائنات المعقدة
interface PaymentResult {
  success: boolean;
  transactionId: string;
  amount: number;
}
```

---

## 📁 هيكل الملفات - File Structure

```
src/
├── components/          # مكونات UI فقط
├── hooks/               # Hooks منظمة في 36 مجلد
│   ├── auth/
│   ├── beneficiary/
│   ├── accounting/
│   └── ...
├── services/            # 54 خدمة لاستعلامات البيانات
├── types/               # أنواع TypeScript
└── lib/                 # أدوات مساعدة
```

---

## ✅ قائمة التحقق قبل الـ Commit

- [ ] لا يوجد `any` في الكود
- [ ] جميع الدوال لها أنواع إرجاع محددة
- [ ] Components لا تستدعي Supabase مباشرة
- [ ] Hooks تستخدم Services للبيانات
- [ ] استخدام `.maybeSingle()` بدلاً من `.single()` للاستعلامات
- [ ] لا يوجد `console.log` (فقط `console.warn`, `console.error`, `console.info`)

---

## 🔧 أوامر الفحص

```bash
# فحص أنواع TypeScript
npx tsc --noEmit

# فحص ESLint
npx eslint src/ --ext .ts,.tsx

# البحث عن any متبقية
grep -r ": any" src/services/ --include="*.ts"
grep -r "Promise<any>" src/ --include="*.ts"

# البحث عن .single() خطرة
grep -r "\.select.*\.eq.*\.single()" src/services/ --include="*.ts"
```

---

## 📊 الإحصائيات الحالية

| المقياس | العدد | الحالة |
|---------|-------|--------|
| استخدامات `any` في الخدمات | 0 | ✅ |
| Components تستدعي Supabase | 0 | ✅ |
| Pages تستدعي Supabase | 0 | ✅ |
| Hooks تستخدم Services | 170+ | ✅ |
| الخدمات الإجمالية | 54 | ✅ |
| استخدام `.maybeSingle()` | 474+ | ✅ |

---

**هذه القواعد إلزامية ولا يُسمح بأي استثناءات بدون موافقة صريحة.**
