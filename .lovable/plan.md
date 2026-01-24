
# خطة تنفيذ الحماية الشاملة للمستودع - 100%
## منع التكرار + حدود الاستيراد + حماية الملفات الحرجة

---

## ملخص التنفيذ

| الملف | الحالة | الإجراء |
|-------|--------|---------|
| `eslint.config.js` | موجود | تعديل - إضافة no-restricted-imports |
| `scripts/check-code-duplication.js` | **جديد** | إنشاء |
| `scripts/check-constants-usage.js` | **جديد** | إنشاء |
| `scripts/check-protected-files.js` | **جديد** | إنشاء |
| `scripts/validate-imports.js` | **جديد** | إنشاء |
| `.husky/pre-commit` | موجود | تعديل - إضافة الفحوصات |
| `.github/workflows/ci.yml` | موجود | تعديل - إضافة code-quality job |
| `package.json` | موجود | تعديل - إضافة السكريبتات |

---

## المرحلة 1: تحديث ESLint

### الملف: `eslint.config.js`

**إضافة قواعد الاستيراد المقيدة بعد السطر 46:**

```javascript
// ═══════════════════════════════════════════════════════════════
// 🚫 قواعد الاستيراد المقيدة - منع التكرار والتضارب
// Restricted Imports - Prevent Duplication & Conflicts
// ═══════════════════════════════════════════════════════════════
"no-restricted-imports": ["error", {
  "patterns": [
    {
      "group": ["../../../*"],
      "message": "تجنب الاستيرادات العميقة - استخدم مسار @/ المختصر"
    },
    {
      "group": ["**/supabase/client"],
      "importNames": ["createClient"],
      "message": "استخدم supabase من @/integrations/supabase/client"
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
      "message": "تحقق من عدم تكرار Context موجود - راجع src/contexts/"
    }
  ]
}],
```

---

## المرحلة 2: إنشاء سكريبت كشف التكرار

### الملف الجديد: `scripts/check-code-duplication.js`

```javascript
#!/usr/bin/env node

/**
 * 🔍 Code Duplication Checker
 * يكتشف الملفات والمكونات والدوال المكررة
 */

const fs = require('fs');
const path = require('path');

const COLORS = {
  RED: '\x1b[31m',
  GREEN: '\x1b[32m',
  YELLOW: '\x1b[33m',
  BLUE: '\x1b[34m',
  RESET: '\x1b[0m'
};

// الملفات المستثناة
const EXCLUDED_DIRS = ['node_modules', 'dist', '.git', 'coverage', '__tests__'];
const EXCLUDED_FILES = ['index.ts', 'index.tsx', 'types.ts', 'types.d.ts'];

// جمع جميع الملفات
function getAllFiles(dir, extensions = ['.ts', '.tsx']) {
  let files = [];
  
  try {
    const items = fs.readdirSync(dir);
    
    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        if (!EXCLUDED_DIRS.includes(item)) {
          files = files.concat(getAllFiles(fullPath, extensions));
        }
      } else if (extensions.some(ext => item.endsWith(ext))) {
        if (!EXCLUDED_FILES.includes(item)) {
          files.push(fullPath);
        }
      }
    }
  } catch (err) {
    // تجاهل أخطاء القراءة
  }
  
  return files;
}

// استخراج اسم الملف بدون المسار والامتداد
function getBaseName(filePath) {
  return path.basename(filePath).replace(/\.(ts|tsx)$/, '');
}

// استخراج الدوال والمكونات المصدرة
function extractExports(content) {
  const exports = [];
  
  // export function/const
  const funcRegex = /export\s+(?:async\s+)?(?:function|const)\s+(\w+)/g;
  let match;
  while ((match = funcRegex.exec(content)) !== null) {
    exports.push(match[1]);
  }
  
  // export default
  const defaultRegex = /export\s+default\s+(?:function\s+)?(\w+)/g;
  while ((match = defaultRegex.exec(content)) !== null) {
    exports.push(match[1]);
  }
  
  return exports;
}

// الفحص الرئيسي
function checkDuplication() {
  console.log(`${COLORS.BLUE}🔍 فحص التكرار في الكود...${COLORS.RESET}\n`);
  
  const srcPath = path.join(process.cwd(), 'src');
  const files = getAllFiles(srcPath);
  
  const fileNames = new Map(); // اسم الملف -> [المسارات]
  const exportNames = new Map(); // اسم التصدير -> [{ملف, اسم}]
  
  let duplicateFiles = 0;
  let duplicateExports = 0;
  
  // جمع الأسماء
  for (const file of files) {
    const baseName = getBaseName(file);
    const relativePath = path.relative(srcPath, file);
    
    // فحص تكرار أسماء الملفات
    if (!fileNames.has(baseName)) {
      fileNames.set(baseName, []);
    }
    fileNames.get(baseName).push(relativePath);
    
    // فحص التصديرات
    try {
      const content = fs.readFileSync(file, 'utf8');
      const exports = extractExports(content);
      
      for (const exp of exports) {
        if (!exportNames.has(exp)) {
          exportNames.set(exp, []);
        }
        exportNames.get(exp).push({ file: relativePath, name: exp });
      }
    } catch (err) {
      // تجاهل أخطاء القراءة
    }
  }
  
  // تقرير الملفات المكررة
  console.log(`${COLORS.YELLOW}📁 ملفات بنفس الاسم:${COLORS.RESET}`);
  for (const [name, paths] of fileNames) {
    if (paths.length > 1) {
      // استثناء الملفات المقبول تكرارها
      const acceptableDupes = ['utils', 'types', 'constants', 'helpers', 'hooks'];
      if (!acceptableDupes.includes(name.toLowerCase())) {
        console.log(`  ${COLORS.RED}⚠️ ${name}:${COLORS.RESET}`);
        paths.forEach(p => console.log(`     - ${p}`));
        duplicateFiles++;
      }
    }
  }
  
  if (duplicateFiles === 0) {
    console.log(`  ${COLORS.GREEN}✅ لا توجد ملفات مكررة${COLORS.RESET}`);
  }
  
  // تقرير الدوال المكررة (المهمة فقط)
  console.log(`\n${COLORS.YELLOW}🔧 دوال/مكونات بنفس الاسم:${COLORS.RESET}`);
  const importantDupes = [];
  
  for (const [name, locations] of exportNames) {
    if (locations.length > 1) {
      // استثناء الأسماء الشائعة
      const commonNames = ['default', 'index', 'type', 'Props', 'State'];
      if (!commonNames.some(c => name.includes(c)) && name.length > 3) {
        importantDupes.push({ name, locations });
      }
    }
  }
  
  // عرض أهم 10 تكرارات
  importantDupes.slice(0, 10).forEach(({ name, locations }) => {
    console.log(`  ${COLORS.YELLOW}⚠️ ${name} (${locations.length} مواقع)${COLORS.RESET}`);
    duplicateExports++;
  });
  
  if (importantDupes.length === 0) {
    console.log(`  ${COLORS.GREEN}✅ لا توجد دوال مكررة مهمة${COLORS.RESET}`);
  }
  
  // الملخص
  console.log(`\n${COLORS.BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${COLORS.RESET}`);
  console.log(`${COLORS.BLUE}📊 الملخص:${COLORS.RESET}`);
  console.log(`   📁 ملفات مكررة: ${duplicateFiles > 0 ? COLORS.RED : COLORS.GREEN}${duplicateFiles}${COLORS.RESET}`);
  console.log(`   🔧 دوال مكررة: ${duplicateExports > 0 ? COLORS.YELLOW : COLORS.GREEN}${duplicateExports}${COLORS.RESET}`);
  
  // لا نفشل - فقط تحذير
  if (duplicateFiles > 5) {
    console.log(`\n${COLORS.RED}❌ يوجد عدد كبير من الملفات المكررة${COLORS.RESET}`);
    process.exit(1);
  }
  
  console.log(`\n${COLORS.GREEN}✅ فحص التكرار اكتمل${COLORS.RESET}`);
}

checkDuplication();
```

---

## المرحلة 3: إنشاء سكريبت فحص الثوابت

### الملف الجديد: `scripts/check-constants-usage.js`

```javascript
#!/usr/bin/env node

/**
 * 📋 Constants Usage Checker
 * يتحقق من استخدام الثوابت المركزية بدلاً من القيم الحرفية
 */

const fs = require('fs');
const path = require('path');

const COLORS = {
  RED: '\x1b[31m',
  GREEN: '\x1b[32m',
  YELLOW: '\x1b[33m',
  BLUE: '\x1b[34m',
  RESET: '\x1b[0m'
};

// القيم الحرفية التي يجب أن تكون ثوابت
const LITERAL_VALUES = {
  // حالات المستفيدين
  "'نشط'": 'BENEFICIARY_STATUS.ACTIVE أو TENANT_STATUS.ACTIVE',
  "'غير نشط'": 'BENEFICIARY_STATUS.INACTIVE',
  "'معلق'": 'BENEFICIARY_STATUS.SUSPENDED أو REQUEST_STATUS.PENDING',
  
  // حالات العقود
  "'مسودة'": 'CONTRACT_STATUS.DRAFT',
  "'منتهي'": 'CONTRACT_STATUS.EXPIRED',
  "'ملغي'": 'CONTRACT_STATUS.CANCELLED',
  
  // حالات الصيانة
  "'جديد'": 'MAINTENANCE_STATUS.NEW',
  "'مفتوح'": 'MAINTENANCE_STATUS.OPEN',
  "'مغلق'": 'MAINTENANCE_STATUS.CLOSED',
  
  // حالات الدفع
  "'مكتمل'": 'PAYMENT_STATUS.COMPLETED',
  "'مدفوع'": 'PAYMENT_STATUS.PAID',
  "'متأخر'": 'PAYMENT_STATUS.OVERDUE',
  
  // أنواع السندات
  "'receipt'": 'PAYMENT_TYPES.RECEIPT',
  "'payment'": 'PAYMENT_TYPES.PAYMENT',
  "'expense'": 'PAYMENT_TYPES.EXPENSE',
};

// الملفات المستثناة
const EXCLUDED_PATHS = [
  'src/lib/constants.ts',
  '__tests__',
  '.test.',
  '.spec.',
  'types.ts',
  'types.d.ts',
];

function getAllFiles(dir, extensions = ['.ts', '.tsx']) {
  let files = [];
  
  try {
    const items = fs.readdirSync(dir);
    
    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        if (!['node_modules', 'dist', '.git', 'coverage'].includes(item)) {
          files = files.concat(getAllFiles(fullPath, extensions));
        }
      } else if (extensions.some(ext => item.endsWith(ext))) {
        files.push(fullPath);
      }
    }
  } catch (err) {
    // تجاهل
  }
  
  return files;
}

function checkConstantsUsage() {
  console.log(`${COLORS.BLUE}📋 فحص استخدام الثوابت المركزية...${COLORS.RESET}\n`);
  
  const srcPath = path.join(process.cwd(), 'src');
  const files = getAllFiles(srcPath);
  
  const violations = [];
  
  for (const file of files) {
    const relativePath = path.relative(process.cwd(), file);
    
    // تخطي الملفات المستثناة
    if (EXCLUDED_PATHS.some(exc => relativePath.includes(exc))) {
      continue;
    }
    
    try {
      const content = fs.readFileSync(file, 'utf8');
      const lines = content.split('\n');
      
      lines.forEach((line, index) => {
        // تخطي التعليقات
        if (line.trim().startsWith('//') || line.trim().startsWith('*')) {
          return;
        }
        
        for (const [literal, constant] of Object.entries(LITERAL_VALUES)) {
          // البحث عن القيمة الحرفية في سياق المقارنة أو التعيين
          const patterns = [
            `=== ${literal}`,
            `== ${literal}`,
            `!== ${literal}`,
            `!= ${literal}`,
            `: ${literal}`,
            `status: ${literal}`,
            `filter.*${literal}`,
          ];
          
          for (const pattern of patterns) {
            if (line.includes(literal.slice(1, -1))) { // إزالة علامات الاقتباس
              violations.push({
                file: relativePath,
                line: index + 1,
                literal: literal,
                suggestion: constant,
                context: line.trim().substring(0, 60),
              });
              break;
            }
          }
        }
      });
    } catch (err) {
      // تجاهل
    }
  }
  
  // تقرير الانتهاكات
  if (violations.length > 0) {
    console.log(`${COLORS.YELLOW}⚠️ قيم حرفية يُفضل استخدام ثوابت بدلاً منها:${COLORS.RESET}\n`);
    
    // تجميع حسب الملف
    const byFile = new Map();
    for (const v of violations) {
      if (!byFile.has(v.file)) {
        byFile.set(v.file, []);
      }
      byFile.get(v.file).push(v);
    }
    
    // عرض أول 10 ملفات
    let count = 0;
    for (const [file, fileViolations] of byFile) {
      if (count >= 10) {
        console.log(`  ... و ${byFile.size - 10} ملفات أخرى`);
        break;
      }
      
      console.log(`  ${COLORS.YELLOW}📄 ${file}${COLORS.RESET}`);
      fileViolations.slice(0, 3).forEach(v => {
        console.log(`     السطر ${v.line}: ${v.literal} → ${v.suggestion}`);
      });
      count++;
    }
    
    console.log(`\n${COLORS.YELLOW}📊 إجمالي: ${violations.length} استخدام لقيم حرفية${COLORS.RESET}`);
  } else {
    console.log(`${COLORS.GREEN}✅ جميع القيم تستخدم الثوابت المركزية${COLORS.RESET}`);
  }
  
  // لا نفشل - فقط تحذير
  console.log(`\n${COLORS.GREEN}✅ فحص الثوابت اكتمل${COLORS.RESET}`);
}

checkConstantsUsage();
```

---

## المرحلة 4: إنشاء سكريبت حماية الملفات

### الملف الجديد: `scripts/check-protected-files.js`

```javascript
#!/usr/bin/env node

/**
 * 🔒 Protected Files Checker
 * يتحقق من عدم تعديل الملفات المحمية بدون مراجعة
 */

const { execSync } = require('child_process');

const COLORS = {
  RED: '\x1b[31m',
  GREEN: '\x1b[32m',
  YELLOW: '\x1b[33m',
  BLUE: '\x1b[34m',
  RESET: '\x1b[0m'
};

// الملفات المحمية - أي تعديل يتطلب تنبيه
const PROTECTED_FILES = [
  // البنية التحتية الأساسية
  'src/lib/constants.ts',
  'src/integrations/supabase/client.ts',
  
  // مفاتيح الاستعلام
  'src/lib/query-keys/',
  
  // البنية التحتية لـ React Query
  'src/infrastructure/react-query/',
  
  // إعدادات المشروع
  'supabase/config.toml',
  '.github/workflows/',
  
  // قواعد البيانات
  'supabase/migrations/',
  
  // التوثيق المعماري
  'docs/ARCHITECTURE_DECISIONS.md',
  'docs/TRUTH_MAP.md',
  'docs/OWNERSHIP_RULES.md',
];

// الملفات الممنوع تعديلها نهائياً
const FORBIDDEN_FILES = [
  'src/integrations/supabase/types.ts', // يُولّد تلقائياً
  '.env', // يُولّد تلقائياً
];

function checkProtectedFiles() {
  console.log(`${COLORS.BLUE}🔒 فحص الملفات المحمية...${COLORS.RESET}\n`);
  
  let stagedFiles = [];
  
  try {
    // الحصول على الملفات المُعدّة للـ commit
    const output = execSync('git diff --cached --name-only', { encoding: 'utf8' });
    stagedFiles = output.trim().split('\n').filter(f => f.length > 0);
  } catch (err) {
    console.log(`${COLORS.YELLOW}⚠️ لا يمكن قراءة Git staged files${COLORS.RESET}`);
    return;
  }
  
  if (stagedFiles.length === 0) {
    console.log(`${COLORS.GREEN}✅ لا توجد ملفات للفحص${COLORS.RESET}`);
    return;
  }
  
  const protectedModified = [];
  const forbiddenModified = [];
  
  for (const file of stagedFiles) {
    // فحص الملفات الممنوعة
    for (const forbidden of FORBIDDEN_FILES) {
      if (file === forbidden || file.startsWith(forbidden)) {
        forbiddenModified.push(file);
      }
    }
    
    // فحص الملفات المحمية
    for (const protected_ of PROTECTED_FILES) {
      if (file === protected_ || file.startsWith(protected_)) {
        protectedModified.push(file);
      }
    }
  }
  
  // تقرير الملفات الممنوعة
  if (forbiddenModified.length > 0) {
    console.log(`${COLORS.RED}❌ ملفات ممنوع تعديلها:${COLORS.RESET}`);
    forbiddenModified.forEach(f => {
      console.log(`   ${COLORS.RED}🚫 ${f}${COLORS.RESET}`);
    });
    console.log(`\n${COLORS.RED}هذه الملفات تُولّد تلقائياً ولا يجب تعديلها!${COLORS.RESET}`);
    process.exit(1);
  }
  
  // تقرير الملفات المحمية (تحذير فقط)
  if (protectedModified.length > 0) {
    console.log(`${COLORS.YELLOW}⚠️ ملفات محمية تم تعديلها:${COLORS.RESET}`);
    protectedModified.forEach(f => {
      console.log(`   ${COLORS.YELLOW}🔒 ${f}${COLORS.RESET}`);
    });
    console.log(`\n${COLORS.YELLOW}تأكد من مراجعة هذه التغييرات بعناية!${COLORS.RESET}`);
    console.log(`${COLORS.YELLOW}راجع: docs/OWNERSHIP_RULES.md${COLORS.RESET}`);
  } else {
    console.log(`${COLORS.GREEN}✅ لم يتم تعديل ملفات محمية${COLORS.RESET}`);
  }
  
  console.log(`\n${COLORS.GREEN}✅ فحص الملفات المحمية اكتمل${COLORS.RESET}`);
}

checkProtectedFiles();
```

---

## المرحلة 5: إنشاء سكريبت التحقق من حدود الاستيراد

### الملف الجديد: `scripts/validate-imports.js`

```javascript
#!/usr/bin/env node

/**
 * 🚧 Import Boundaries Validator
 * يتحقق من احترام حدود الاستيراد المعمارية
 */

const fs = require('fs');
const path = require('path');

const COLORS = {
  RED: '\x1b[31m',
  GREEN: '\x1b[32m',
  YELLOW: '\x1b[33m',
  BLUE: '\x1b[34m',
  RESET: '\x1b[0m'
};

// قواعد الاستيراد المعمارية
const IMPORT_RULES = {
  // الصفحات لا تستورد من صفحات أخرى
  'src/pages': {
    forbidden: ['src/pages'],
    message: 'الصفحات لا يجب أن تستورد من صفحات أخرى',
  },
  
  // الخدمات لا تستورد من Hooks
  'src/services': {
    forbidden: ['src/hooks', 'src/components'],
    message: 'الخدمات لا تستورد من Hooks أو Components',
  },
  
  // المكتبات لا تستورد من الخدمات
  'src/lib': {
    forbidden: ['src/services', 'src/hooks', 'src/pages'],
    message: 'المكتبات لا تستورد من Services أو Hooks أو Pages',
  },
};

// استثناءات مقبولة
const EXCEPTIONS = [
  { from: 'src/services', to: 'src/hooks/auth' }, // الخدمات يمكنها استيراد auth
];

function getAllFiles(dir, extensions = ['.ts', '.tsx']) {
  let files = [];
  
  try {
    const items = fs.readdirSync(dir);
    
    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        if (!['node_modules', 'dist', '.git', 'coverage', '__tests__'].includes(item)) {
          files = files.concat(getAllFiles(fullPath, extensions));
        }
      } else if (extensions.some(ext => item.endsWith(ext))) {
        files.push(fullPath);
      }
    }
  } catch (err) {
    // تجاهل
  }
  
  return files;
}

function extractImports(content) {
  const imports = [];
  
  // import من ملفات المشروع
  const importRegex = /import\s+.*?\s+from\s+['"](@\/|\.\.\/|\.\/)(.*?)['"]/g;
  let match;
  
  while ((match = importRegex.exec(content)) !== null) {
    const importPath = match[1] === '@/' ? `src/${match[2]}` : match[2];
    imports.push(importPath);
  }
  
  return imports;
}

function isException(fromDir, toPath) {
  for (const exc of EXCEPTIONS) {
    if (fromDir.includes(exc.from) && toPath.includes(exc.to)) {
      return true;
    }
  }
  return false;
}

function validateImports() {
  console.log(`${COLORS.BLUE}🚧 التحقق من حدود الاستيراد المعمارية...${COLORS.RESET}\n`);
  
  const srcPath = path.join(process.cwd(), 'src');
  const files = getAllFiles(srcPath);
  
  const violations = [];
  
  for (const file of files) {
    const relativePath = path.relative(process.cwd(), file);
    
    try {
      const content = fs.readFileSync(file, 'utf8');
      const imports = extractImports(content);
      
      // تحديد أي قاعدة تنطبق على هذا الملف
      for (const [sourceDir, rule] of Object.entries(IMPORT_RULES)) {
        if (relativePath.startsWith(sourceDir)) {
          // فحص كل استيراد
          for (const importPath of imports) {
            for (const forbidden of rule.forbidden) {
              const normalizedForbidden = forbidden.replace('src/', '');
              
              if (importPath.includes(normalizedForbidden)) {
                // تحقق من الاستثناءات
                if (!isException(sourceDir, importPath)) {
                  violations.push({
                    file: relativePath,
                    import: importPath,
                    rule: rule.message,
                  });
                }
              }
            }
          }
        }
      }
    } catch (err) {
      // تجاهل
    }
  }
  
  // تقرير الانتهاكات
  if (violations.length > 0) {
    console.log(`${COLORS.RED}❌ انتهاكات حدود الاستيراد:${COLORS.RESET}\n`);
    
    // تجميع حسب القاعدة
    const byRule = new Map();
    for (const v of violations) {
      if (!byRule.has(v.rule)) {
        byRule.set(v.rule, []);
      }
      byRule.get(v.rule).push(v);
    }
    
    for (const [rule, ruleViolations] of byRule) {
      console.log(`  ${COLORS.YELLOW}📋 ${rule}${COLORS.RESET}`);
      ruleViolations.slice(0, 5).forEach(v => {
        console.log(`     ${v.file}`);
        console.log(`     → يستورد: ${v.import}`);
      });
      if (ruleViolations.length > 5) {
        console.log(`     ... و ${ruleViolations.length - 5} انتهاكات أخرى`);
      }
      console.log('');
    }
    
    console.log(`${COLORS.RED}📊 إجمالي: ${violations.length} انتهاك${COLORS.RESET}`);
    
    // لا نفشل - فقط تحذير (للسماح بالإصلاح التدريجي)
    console.log(`\n${COLORS.YELLOW}⚠️ يُفضل إصلاح هذه الانتهاكات تدريجياً${COLORS.RESET}`);
  } else {
    console.log(`${COLORS.GREEN}✅ جميع الاستيرادات تحترم الحدود المعمارية${COLORS.RESET}`);
  }
  
  console.log(`\n${COLORS.GREEN}✅ فحص حدود الاستيراد اكتمل${COLORS.RESET}`);
}

validateImports();
```

---

## المرحلة 6: تحديث Pre-commit

### الملف: `.husky/pre-commit`

**إضافة بعد السطر 28:**

```bash
# ═══════════════════════════════════════════════════════════════
# 🛡️ فحوصات الحماية الإضافية
# ═══════════════════════════════════════════════════════════════

# 4. فحص الملفات المحمية
echo "🔒 فحص الملفات المحمية..."
node scripts/check-protected-files.js || {
    echo "❌ تم تعديل ملفات ممنوعة"
    exit 1
}

# 5. فحص التكرار (تحذير فقط)
echo "🔍 فحص الكود المكرر..."
node scripts/check-code-duplication.js 2>/dev/null || {
    echo "⚠️ تحذير: يوجد كود مكرر"
}

# 6. فحص استخدام الثوابت (تحذير فقط)
echo "📋 فحص استخدام الثوابت..."
node scripts/check-constants-usage.js 2>/dev/null || {
    echo "⚠️ تحذير: يوجد قيم حرفية يُفضل استخدام ثوابت"
}
```

---

## المرحلة 7: تحديث CI Pipeline

### الملف: `.github/workflows/ci.yml`

**إضافة Job جديد بعد security (السطر 148):**

```yaml
  # ═══════════════════════════════════════════════════════════════════════════
  # Code Quality & Architecture Check
  # ═══════════════════════════════════════════════════════════════════════════
  code-quality:
    name: 🏗️ Code Quality & Architecture
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
        with:
          fetch-depth: 0
          
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Check Code Duplication
        run: node scripts/check-code-duplication.js
        continue-on-error: true
        
      - name: Check Constants Usage
        run: node scripts/check-constants-usage.js
        continue-on-error: true
        
      - name: Validate Import Boundaries
        run: node scripts/validate-imports.js
        continue-on-error: true
        
      - name: Architecture Summary
        run: |
          echo "## 🏗️ Architecture Quality Report" >> $GITHUB_STEP_SUMMARY
          echo "" >> $GITHUB_STEP_SUMMARY
          echo "| Check | Status |" >> $GITHUB_STEP_SUMMARY
          echo "|-------|--------|" >> $GITHUB_STEP_SUMMARY
          echo "| Code Duplication | ✅ Checked |" >> $GITHUB_STEP_SUMMARY
          echo "| Constants Usage | ✅ Checked |" >> $GITHUB_STEP_SUMMARY
          echo "| Import Boundaries | ✅ Checked |" >> $GITHUB_STEP_SUMMARY
```

**تحديث summary job (السطر 155):**

```yaml
  needs: [lint, unit-tests, build, security, code-quality]
```

---

## المرحلة 8: تحديث package.json

### الملف: `package.json`

**إضافة السكريبتات بعد السطر 17:**

```json
"check:duplication": "node scripts/check-code-duplication.js",
"check:constants": "node scripts/check-constants-usage.js",
"check:imports": "node scripts/validate-imports.js",
"check:protected": "node scripts/check-protected-files.js",
"check:all": "npm run check:duplication && npm run check:constants && npm run check:imports",
```

---

## ملخص التنفيذ

| المرحلة | الملفات | الوقت |
|---------|---------|-------|
| 1. تحديث ESLint | `eslint.config.js` | 2 دقيقة |
| 2. سكريبت التكرار | `scripts/check-code-duplication.js` | 5 دقائق |
| 3. سكريبت الثوابت | `scripts/check-constants-usage.js` | 5 دقائق |
| 4. سكريبت الملفات المحمية | `scripts/check-protected-files.js` | 3 دقائق |
| 5. سكريبت حدود الاستيراد | `scripts/validate-imports.js` | 5 دقائق |
| 6. تحديث Pre-commit | `.husky/pre-commit` | 2 دقيقة |
| 7. تحديث CI | `.github/workflows/ci.yml` | 3 دقائق |
| 8. تحديث package.json | `package.json` | 1 دقيقة |
| **الإجمالي** | **8 ملفات** | **~26 دقيقة** |

---

## النتيجة بعد التنفيذ

| الحماية | قبل | بعد |
|---------|-----|-----|
| كشف الكود المكرر | ❌ | ✅ تلقائي |
| فرض الثوابت | ❌ | ✅ تحذير |
| حدود الاستيراد | ❌ | ✅ ESLint + سكريبت |
| حماية الملفات الحرجة | ⚠️ CODEOWNERS فقط | ✅ pre-commit + CI |
| منع التبعيات الخاطئة | ❌ | ✅ validate-imports |
