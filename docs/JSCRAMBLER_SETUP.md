# إعداد Jscrambler لحماية الكود

## نظرة عامة

يوفر Jscrambler حماية متقدمة للكود من:
- الهندسة العكسية (Reverse Engineering)
- التلاعب بالكود (Code Tampering)
- سرقة الملكية الفكرية

## المتطلبات

1. **حساب Jscrambler نشط** - [التسجيل](https://jscrambler.com)
2. **بيانات الاعتماد**:
   - Application ID
   - Access Key
   - Secret Key

## خطوات الإعداد

### 1. الحصول على بيانات الاعتماد

1. سجّل الدخول إلى [لوحة تحكم Jscrambler](https://app.jscrambler.com)
2. انتقل إلى **Applications** > **Your App** > **Settings**
3. انسخ:
   - `Application ID`
   - `Access Key`
   - `Secret Key`

### 2. إعداد أسرار GitHub

انتقل إلى: `Repository` → `Settings` → `Secrets and variables` → `Actions`

أضف الأسرار التالية:

| الاسم | الوصف |
|-------|--------|
| `JSCRAMBLER_APPLICATION_ID` | معرّف التطبيق |
| `JSCRAMBLER_ACCESS_KEY` | مفتاح الوصول |
| `JSCRAMBLER_SECRET_KEY` | المفتاح السري |

### 3. تخصيص التكوين (اختياري)

عدّل `jscrambler.json` حسب احتياجاتك:

```json
{
  "params": [
    {"name": "whitespaceRemoval"},
    {"name": "identifiersRenaming", "options": {"mode": "SAFEST"}},
    {"name": "stringConcealing"},
    // أضف تحويلات إضافية
  ]
}
```

## التحويلات المتاحة

| التحويل | الوصف |
|---------|--------|
| `whitespaceRemoval` | إزالة المسافات البيضاء |
| `identifiersRenaming` | إعادة تسمية المتغيرات |
| `stringConcealing` | إخفاء النصوص |
| `functionReordering` | إعادة ترتيب الدوال |
| `controlFlowFlattening` | تسطيح تدفق التحكم |
| `selfDefending` | حماية ذاتية ضد التصحيح |

## التحقق من العمل

بعد الإعداد:

1. ادفع تغييراً إلى `main` أو أنشئ PR
2. تحقق من **Actions** > **Jscrambler Code Integrity**
3. يجب أن ترى ✅ إذا نجحت الحماية

## استكشاف الأخطاء

### الخطأ: "Secrets not configured"
- تأكد من إضافة جميع الأسرار الثلاثة بشكل صحيح

### الخطأ: "Invalid credentials"
- تحقق من صحة بيانات الاعتماد في لوحة Jscrambler

### الخطأ: "Build failed"
- تأكد من نجاح `npm run build` محلياً أولاً

## الموارد

- [توثيق Jscrambler](https://docs.jscrambler.com)
- [قائمة التحويلات](https://docs.jscrambler.com/code-integrity/documentation/transformations)
- [دليل التكوين](https://docs.jscrambler.com/code-integrity/documentation/configuration)
