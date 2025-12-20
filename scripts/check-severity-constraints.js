#!/usr/bin/env node
/**
 * 🔍 فحص تلقائي لتوافق severity مع قيود قاعدة البيانات
 * يُنفذ قبل كل commit عبر lint-staged وقبل النشر
 * 
 * القاعدة الأساسية:
 * - system_alerts: يقبل فقط ['low', 'medium', 'high', 'critical']
 * - system_error_logs: يقبل فقط ['low', 'medium', 'high', 'critical']
 * - audit_logs: يقبل ['info', 'warning', 'error', 'critical']
 */

const fs = require('fs');
const path = require('path');

// =====================================================
// تعريف الـ Constraints
// =====================================================

const DB_CONSTRAINTS = {
  system_alerts: {
    severity: ['low', 'medium', 'high', 'critical'],
    forbidden: ['info'],
  },
  system_error_logs: {
    severity: ['low', 'medium', 'high', 'critical'],
    forbidden: ['info'],
  },
  audit_logs: {
    severity: ['info', 'warning', 'error', 'critical'],
    forbidden: [],
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
  
  // أنماط البحث عن استخدام الجداول مع severity
  const tablePatterns = [
    { table: 'system_alerts', regex: /from\s*\(\s*['"`]system_alerts['"`]\s*\)/gi },
    { table: 'system_error_logs', regex: /from\s*\(\s*['"`]system_error_logs['"`]\s*\)/gi },
  ];
  
  // ابحث عن كل استخدام للجداول
  for (const { table, regex } of tablePatterns) {
    let match;
    const contentCopy = content;
    
    // أعد تعيين الـ regex
    regex.lastIndex = 0;
    
    while ((match = regex.exec(contentCopy)) !== null) {
      const matchPosition = match.index;
      
      // ابحث عن severity في السياق القريب (500 حرف بعد الجدول)
      const contextAfter = contentCopy.substring(matchPosition, matchPosition + 800);
      
      // ابحث عن severity: 'info' أو severity: "info"
      const severityInfoMatch = contextAfter.match(/severity\s*:\s*['"`]info['"`]/i);
      
      if (severityInfoMatch) {
        // احسب رقم السطر
        const textBeforeMatch = contentCopy.substring(0, matchPosition);
        const lineNumber = textBeforeMatch.split('\n').length;
        
        // ابحث عن السطر الذي يحتوي على severity
        const severityLineOffset = contextAfter.substring(0, severityInfoMatch.index).split('\n').length - 1;
        
        errors.push({
          file: filePath,
          line: lineNumber + severityLineOffset,
          table: table,
          forbidden: 'info',
          allowed: DB_CONSTRAINTS[table].severity,
          context: getLineContext(lines, lineNumber + severityLineOffset - 1, 2),
        });
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
  console.log('\n' + colorize('blue', '🔍 فحص توافق severity مع DB constraints...'));
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
    index === self.findIndex((e) => e.file === error.file && e.line === error.line)
  );
  
  if (uniqueErrors.length > 0) {
    console.log(colorize('red', '❌ فشل فحص توافق severity:\n'));
    
    for (const err of uniqueErrors) {
      console.log(colorize('yellow', `  📍 ${path.relative(process.cwd(), err.file)}:${err.line}`));
      console.log(`     ${colorize('blue', 'الجدول:')} ${err.table}`);
      console.log(`     ${colorize('red', 'القيمة المستخدمة:')} '${err.forbidden}' ❌`);
      console.log(`     ${colorize('green', 'القيم المسموحة:')} ${err.allowed.join(', ')}`);
      console.log('');
      console.log(colorize('blue', '     السياق:'));
      console.log(err.context.split('\n').map(l => '     ' + l).join('\n'));
      console.log('');
    }
    
    console.log('═'.repeat(60));
    console.log('');
    console.log(colorize('yellow', `💡 الحل: استبدل severity: 'info' بـ severity: 'low'`));
    console.log('');
    console.log(`   ${colorize('blue', 'الجداول التي لا تقبل info:')}`);
    console.log(`   • system_alerts`);
    console.log(`   • system_error_logs`);
    console.log('');
    console.log(`   ${colorize('blue', 'الجداول التي تقبل info:')}`);
    console.log(`   • audit_logs`);
    console.log('');
    
    process.exit(1);
  }
  
  console.log(colorize('green', '✅ جميع قيم severity متوافقة مع DB constraints'));
  console.log('');
  process.exit(0);
}

// تشغيل الفحص
main();
