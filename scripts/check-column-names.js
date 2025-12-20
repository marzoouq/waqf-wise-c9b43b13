#!/usr/bin/env node
/**
 * 🔍 فحص تلقائي لاستخدام أسماء الأعمدة الصحيحة
 * يُنفذ قبل كل commit عبر lint-staged وقبل النشر
 * 
 * القواعد الأساسية:
 * - properties: استخدم location بدلاً من address
 * - properties: استخدم type بدلاً من property_type
 */

const fs = require('fs');
const path = require('path');

// =====================================================
// قواعد الأعمدة الممنوعة
// =====================================================

const COLUMN_RULES = {
  properties: {
    forbidden: {
      // الاسم الممنوع -> الاسم الصحيح
      address: 'location',
      property_type: 'type',
    },
    // أنماط البحث عن استخدام الجدول
    patterns: [
      /from\s*\(\s*['"`]properties['"`]\s*\)/gi,
      /\.from\s*\(\s*['"`]properties['"`]\s*\)/gi,
    ],
  },
};

// =====================================================
// ألوان للإخراج
// =====================================================

const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m',
};

function colorize(color, text) {
  return `${colors[color]}${text}${colors.reset}`;
}

// =====================================================
// دوال الفحص
// =====================================================

/**
 * فحص ملف واحد للبحث عن استخدامات غير صحيحة
 */
function scanFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');
  const errors = [];
  
  // فحص كل جدول وأعمدته الممنوعة
  for (const [tableName, rules] of Object.entries(COLUMN_RULES)) {
    const { forbidden, patterns } = rules;
    
    for (const pattern of patterns) {
      pattern.lastIndex = 0;
      let match;
      
      while ((match = pattern.exec(content)) !== null) {
        const matchPosition = match.index;
        
        // ابحث في السياق القريب (1000 حرف بعد الجدول)
        const contextAfter = content.substring(matchPosition, matchPosition + 1000);
        
        // فحص كل عمود ممنوع
        for (const [deprecatedColumn, correctColumn] of Object.entries(forbidden)) {
          // أنماط البحث عن العمود الممنوع
          const columnPatterns = [
            // .select('address')
            new RegExp(`\\.select\\s*\\([^)]*['"\`]${deprecatedColumn}['"\`]`, 'i'),
            // { address: ... }
            new RegExp(`[{,]\\s*${deprecatedColumn}\\s*:`, 'i'),
            // .address
            new RegExp(`\\.${deprecatedColumn}\\b`, 'i'),
            // ['address']
            new RegExp(`\\['${deprecatedColumn}'\\]`, 'i'),
            // update({ address: ... })
            new RegExp(`\\.update\\s*\\([^)]*${deprecatedColumn}\\s*:`, 'i'),
            // insert({ address: ... })
            new RegExp(`\\.insert\\s*\\([^)]*${deprecatedColumn}\\s*:`, 'i'),
          ];
          
          for (const colPattern of columnPatterns) {
            if (colPattern.test(contextAfter)) {
              // احسب رقم السطر
              const textBeforeMatch = content.substring(0, matchPosition);
              const baseLineNumber = textBeforeMatch.split('\n').length;
              
              // ابحث عن السطر الدقيق الذي يحتوي على العمود الممنوع
              const contextLines = contextAfter.split('\n');
              let exactLine = baseLineNumber;
              
              for (let i = 0; i < Math.min(contextLines.length, 20); i++) {
                if (contextLines[i].includes(deprecatedColumn)) {
                  exactLine = baseLineNumber + i;
                  break;
                }
              }
              
              errors.push({
                file: filePath,
                line: exactLine,
                table: tableName,
                deprecatedColumn,
                correctColumn,
                context: getLineContext(lines, exactLine - 1, 2),
              });
              
              break; // تجنب التكرار لنفس العمود
            }
          }
        }
      }
    }
  }
  
  return errors;
}

/**
 * الحصول على سياق الأسطر حول السطر المحدد
 */
function getLineContext(lines, lineIndex, range) {
  const start = Math.max(0, lineIndex - range);
  const end = Math.min(lines.length, lineIndex + range + 1);
  
  return lines.slice(start, end).map((line, i) => {
    const actualLine = start + i + 1;
    const marker = actualLine === lineIndex + 1 ? '>>>' : '   ';
    return `${marker} ${actualLine}: ${line}`;
  }).join('\n');
}

/**
 * فحص مجلد بشكل تكراري
 */
function scanDirectory(dir) {
  const errors = [];
  
  if (!fs.existsSync(dir)) {
    return errors;
  }
  
  const items = fs.readdirSync(dir);
  
  for (const item of items) {
    const fullPath = path.join(dir, item);
    
    try {
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        // تجاهل node_modules و .git
        if (!['node_modules', '.git', 'dist', 'build'].includes(item)) {
          errors.push(...scanDirectory(fullPath));
        }
      } else if (item.endsWith('.ts') || item.endsWith('.tsx')) {
        errors.push(...scanFile(fullPath));
      }
    } catch (err) {
      // تجاهل الأخطاء في الوصول للملفات
    }
  }
  
  return errors;
}

/**
 * فحص ملفات محددة (للاستخدام مع lint-staged)
 */
function scanFiles(files) {
  const errors = [];
  
  for (const file of files) {
    if (fs.existsSync(file) && (file.endsWith('.ts') || file.endsWith('.tsx'))) {
      errors.push(...scanFile(file));
    }
  }
  
  return errors;
}

// =====================================================
// التنفيذ الرئيسي
// =====================================================

function main() {
  console.log('\n' + colorize('blue', '🔍 فحص أسماء الأعمدة في قاعدة البيانات...'));
  console.log('');
  
  let errors = [];
  
  // تحقق إذا تم تمرير ملفات محددة (من lint-staged)
  const args = process.argv.slice(2);
  
  if (args.length > 0 && !args[0].startsWith('-')) {
    // فحص ملفات محددة
    errors = scanFiles(args);
  } else {
    // فحص كامل للمشروع
    const dirsToScan = [
      path.join(__dirname, '..', 'supabase', 'functions'),
      path.join(__dirname, '..', 'src'),
    ];
    
    for (const dir of dirsToScan) {
      errors.push(...scanDirectory(dir));
    }
  }
  
  // إزالة الأخطاء المكررة
  const uniqueErrors = errors.filter((error, index, self) =>
    index === self.findIndex((e) => 
      e.file === error.file && 
      e.line === error.line && 
      e.deprecatedColumn === error.deprecatedColumn
    )
  );
  
  if (uniqueErrors.length > 0) {
    console.log(colorize('red', '❌ تم العثور على أسماء أعمدة قديمة/خاطئة:\n'));
    
    for (const err of uniqueErrors) {
      console.log(colorize('yellow', `  📍 ${path.relative(process.cwd(), err.file)}:${err.line}`));
      console.log(`     ${colorize('blue', 'الجدول:')} ${err.table}`);
      console.log(`     ${colorize('red', 'العمود المستخدم:')} '${err.deprecatedColumn}' ❌`);
      console.log(`     ${colorize('green', 'العمود الصحيح:')} '${err.correctColumn}' ✓`);
      console.log('');
      console.log(colorize('cyan', '     السياق:'));
      console.log(err.context.split('\n').map(l => '     ' + l).join('\n'));
      console.log('');
    }
    
    console.log('═'.repeat(60));
    console.log('');
    console.log(colorize('yellow', '💡 التصحيحات المطلوبة:'));
    console.log('');
    
    // تجميع التصحيحات الفريدة
    const corrections = [...new Set(uniqueErrors.map(e => 
      `   • ${e.table}: استبدل '${e.deprecatedColumn}' بـ '${e.correctColumn}'`
    ))];
    corrections.forEach(c => console.log(c));
    
    console.log('');
    
    process.exit(1);
  }
  
  console.log(colorize('green', '✅ جميع أسماء الأعمدة صحيحة ومتوافقة مع قاعدة البيانات'));
  console.log('');
  process.exit(0);
}

// تشغيل الفحص
main();
