# تجاوز المصادقة للاختبار (DEV_BYPASS_AUTH)

## الوصف
نظام تجاوز مؤقت للمصادقة يُستخدم لاختبار الواجهات والصفحات المحمية في وضع التطوير فقط.

## ⚠️ تحذير أمني هام
- هذا النظام يعمل **فقط** في وضع التطوير (`import.meta.env.DEV`)
- **لا يجب أبداً** تفعيله في الإنتاج
- يظهر تحذير في Console عند التفعيل

## الملفات المعدلة

### 1. `src/contexts/AuthContext.tsx`
```typescript
// DEV_BYPASS_AUTH flag
const DEV_BYPASS_AUTH = import.meta.env.DEV && import.meta.env.VITE_DEV_BYPASS_AUTH === 'true';

// مستخدم وهمي للاختبار
const DEV_MOCK_USER = DEV_BYPASS_AUTH ? {
  id: 'dev-test-user-uuid',
  email: 'dev-nazer@test.local',
  // ...
} : null;

const DEV_MOCK_ROLES = DEV_BYPASS_AUTH ? ['nazer', 'admin'] : [];
const DEV_MOCK_PROFILE = DEV_BYPASS_AUTH ? { ... } : null;

// في AuthProvider - استخدام القيم الوهمية كقيم ابتدائية
const [user, setUser] = useState<User | null>(DEV_MOCK_USER);
const [roles, setRoles] = useState<string[]>(DEV_MOCK_ROLES);
const [profile, setProfile] = useState<Profile | null>(DEV_MOCK_PROFILE);
const [isLoading, setIsLoading] = useState(DEV_BYPASS_AUTH ? false : true);
const [isInitialized, setIsInitialized] = useState(DEV_BYPASS_AUTH ? true : false);
```

### 2. `src/components/auth/ProtectedRoute.tsx`
```typescript
const DEV_BYPASS_AUTH = import.meta.env.DEV && import.meta.env.VITE_DEV_BYPASS_AUTH === 'true';

export function ProtectedRoute({ children, ... }: ProtectedRouteProps) {
  // تجاوز المصادقة في وضع التطوير
  if (DEV_BYPASS_AUTH) {
    console.warn('[DEV] 🔓 تم تجاوز المصادقة في ProtectedRoute - للاختبار فقط!');
    return <>{children}</>;
  }
  // ... باقي الكود
}
```

### 3. `.env.local` (جديد)
```
VITE_DEV_BYPASS_AUTH=true
```

## كيفية التفعيل
1. أنشئ ملف `.env.local` في جذر المشروع
2. أضف السطر: `VITE_DEV_BYPASS_AUTH=true`
3. أعد تشغيل خادم التطوير

## كيفية الإلغاء
1. احذف ملف `.env.local` أو غيّر القيمة إلى `false`
2. أعد تشغيل خادم التطوير

## الأدوار الوهمية المتاحة
عند تفعيل التجاوز، يتم محاكاة مستخدم بالأدوار التالية:
- `nazer` (ناظر)
- `admin` (مدير)

## التاريخ
- **تاريخ الإضافة:** 2025-12-15
- **الإصدار:** v2.9.23
- **السبب:** اختبار واجهات الجوال والـ Sidebar بدون الحاجة لتسجيل الدخول

## ملاحظات
- المستخدم الوهمي يحمل اسم "مستخدم اختباري - ناظر"
- البريد الإلكتروني الوهمي: `dev-nazer@test.local`
- جميع صلاحيات الناظر والمدير متاحة
