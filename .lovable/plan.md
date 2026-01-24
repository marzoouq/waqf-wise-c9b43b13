

# خطة تنفيذ الحماية الشاملة للمستودع
## منع التكرار + حدود الاستيراد + حماية الملفات

---

## الوضع الحالي بعد الفحص

### ✅ موجود ويعمل

| العنصر | الملف | الحالة |
|--------|-------|--------|
| CODEOWNERS | `.github/CODEOWNERS` | 36 مسار محمي |
| Pre-commit Hooks | `.husky/pre-commit` | TypeScript + lint-staged |
| no-duplicate-imports | `eslint.config.js:46` | يمنع الاستيراد المكرر |
| no-explicit-any | `eslint.config.js:32` | يمنع استخدام any |

### ❌ غير موجود (المطلوب تنفيذه)

| العنصر | الوظيفة |
|--------|---------|
| `scripts/check-code-duplication.js` | كشف الكود المكرر |
| `scripts/check-constants-usage.js` | فرض استخدام الثوابت |
| `scripts/check-protected-files.js` | حماية الملفات الحرجة |
| `scripts/validate-imports.js` | التحقق من حدود الاستيراد |
| `no-restricted-imports` | قواعد ESLint للاستيراد المقيد |

---

## المرحلة 1: تحديث ESLint (إضافة حدود الاستيراد)

### الملف: `eslint.config.js`

**الإضافات المطلوبة:**

```javascript
// إضافة بعد السطر 46 (no-duplicate-imports)

// قواعد الاستيراد المقيدة - منع التكرار والتضارب
"no-restricted-imports": ["error", {
  "patterns": [
    {
      "group": ["../../../*"],
      "message": "تجنب الاستيرادات العميقة - استخدم مسار @/ المختصر"
    }
  ],
  "paths": [
    {
      "name": "@tanstack/react-query",
      "importNames": ["QueryClient"],
      "message": "استخدم getQueryClient من @/infrastructure/react-query"
    },
    {
      "name": "react",
      "importNames": ["createContext"],
      "message": "تأكد من عدم تكرار Context موجود - راجع src/contexts/"
    }
  ]
}],
```

---

## المرحلة 2: سكريبت كشف التكرار

### الملف: `scripts/check-code-duplication.js`

```text
الوظائف:
├── فحص أسماء الملفات المتكررة (نفس الاسم في مجلدات مختلفة)
├── فحص الدوال المصدرة بنفس الاسم
├── فحص المكونات بنفس الاسم
├── تحذير إذا وجد تكرار > 80%
└── تقرير بجميع التكرارات

المخرجات:
├── 🔴 خطأ: ملفان بنفس الاسم والوظيفة
├── 🟡 تحذير: دالتان بنفس التوقيع
└── ✅ نجاح: لا يوجد تكرار
```

---

## المرحلة 3: سكريبت فرض الثوابت

### الملف: `scripts/check-constants-usage.js`

```text
يفحص الاستخدامات الخاطئة:
├── 'نشط' بدلاً من BENEFICIARY_STATUS.ACTIVE
├── 'active' بدلاً من TENANT_STATUS.ACTIVE
├── 'receipt' بدلاً من PAYMENT_TYPES.RECEIPT
├── 'جديد' بدلاً من MAINTENANCE_STATUS.NEW
└── أي قيم حرفية يجب أن تكون ثوابت

الملفات المستثناة:
├── src/lib/constants.ts (الملف المصدر)
├── *.test.ts (ملفات الاختبار)
└── *.d.ts (ملفات الأنواع)
```

---

## المرحلة 4: سكريبت حماية الملفات الحرجة

### الملف: `scripts/check-protected-files.js`

```text
الملفات المحمية (تتطلب تنبيه خاص):
├── src/lib/constants.ts
├── src/infrastructure/react-query/*
├── src/lib/query-keys/*
├── src/integrations/supabase/client.ts
├── supabase/migrations/*.sql
└── .github/workflows/*

السلوك:
├── يُشغّل في pre-commit
├── يعرض تحذير عند تعديل ملف محمي
└── يطلب تأكيد (في CI يفشل إذا لم يكن PR approved)
```

---

## المرحلة 5: سكريبت التحقق من حدود الاستيراد

### الملف: `scripts/validate-imports.js`

```text
القواعد المعمارية:
├── src/pages/* → لا تستورد من src/pages/* أخرى
├── src/services/* → لا تستورد من src/hooks/*
├── src/lib/* → لا تستورد من src/services/*
├── src/components/* → تستورد فقط من src/lib/* و src/hooks/*
└── Edge Functions → لا تستورد من src/*

يكتشف:
├── 🔴 التبعيات الدائرية (Circular Dependencies)
├── 🔴 اختراق الطبقات (Layer Violations)
└── 🟡 استيرادات عميقة جداً (Deep Imports)
```

---

## المرحلة 6: تحديث Pre-commit

### الملف: `.husky/pre-commit`

**الإضافات:**

```bash
# 4. فحص التكرار
echo "🔍 فحص الكود المكرر..."
node scripts/check-code-duplication.js || {
    echo "⚠️ تم اكتشاف كود مكرر - راجع التقرير"
}

# 5. فحص استخدام الثوابت
echo "📋 فحص استخدام الثوابت..."
node scripts/check-constants-usage.js || {
    echo "⚠️ يوجد قيم حرفية يجب أن تكون ثوابت"
}

# 6. فحص الملفات المحمية
echo "🔒 فحص الملفات المحمية..."
node scripts/check-protected-files.js || {
    echo "⚠️ تم تعديل ملفات محمية - تحتاج مراجعة"
}
```

---

## المرحلة 7: تحديث CI Pipeline

### الملف: `.github/workflows/ci.yml`

**إضافة Job جديد:**

```yaml
# بعد job الـ lint
code-quality:
  name: 🔍 Code Quality & Duplication Check
  runs-on: ubuntu-latest
  
  steps:
    - uses: actions/checkout@v4
    - uses: actions/setup-node@v4
      with:
        node-version: '20'
        cache: 'npm'
    - run: npm ci
    
    - name: Check Code Duplication
      run: node scripts/check-code-duplication.js
      
    - name: Check Constants Usage
      run: node scripts/check-constants-usage.js
      
    - name: Validate Import Boundaries
      run: node scripts/validate-imports.js
```

---

## المرحلة 8: تحديث package.json

**إضافة السكريبتات:**

```json
"scripts": {
  "check:duplication": "node scripts/check-code-duplication.js",
  "check:constants": "node scripts/check-constants-usage.js",
  "check:imports": "node scripts/validate-imports.js",
  "check:protected": "node scripts/check-protected-files.js",
  "check:all": "npm run check:duplication && npm run check:constants && npm run check:imports"
}
```

---

## ملخص الملفات

### ملفات جديدة (4):
```text
scripts/check-code-duplication.js
scripts/check-constants-usage.js
scripts/check-protected-files.js
scripts/validate-imports.js
```

### ملفات تُعدّل (4):
```text
eslint.config.js          # إضافة no-restricted-imports
.husky/pre-commit         # إضافة الفحوصات الجديدة
.github/workflows/ci.yml  # إضافة code-quality job
package.json              # إضافة السكريبتات الجديدة
```

---

## النتيجة المتوقعة بعد التنفيذ

| الحماية | قبل | بعد |
|---------|-----|-----|
| كشف الكود المكرر | ❌ | ✅ تلقائي في pre-commit |
| فرض الثوابت | ⚠️ توثيق فقط | ✅ فحص إجباري |
| حدود الاستيراد | ❌ | ✅ ESLint + سكريبت |
| حماية الملفات الحرجة | ⚠️ CODEOWNERS | ✅ pre-commit + CI |
| منع التبعيات الدائرية | ❌ | ✅ سكريبت تلقائي |

---

## الوقت المتوقع

| المرحلة | الوقت |
|---------|-------|
| تحديث ESLint | 5 دقائق |
| إنشاء 4 سكريبتات | 25 دقيقة |
| تحديث Pre-commit | 5 دقائق |
| تحديث CI | 5 دقائق |
| تحديث package.json | 2 دقيقة |
| **الإجمالي** | **~42 دقيقة** |

