/**
 * Real Library Tests - اختبارات المكتبات الحقيقية
 * @version 1.0.0
 * اختبارات تفحص الدوال فعلياً بمدخلات ومخرجات حقيقية
 */

// استيراد الدوال للاختبار الحقيقي
import { cn } from '@/lib/utils';
import { 
  formatCurrency, 
  formatNumber, 
  formatPercentage,
  formatPhoneNumber,
  formatNationalId,
  truncate,
  formatFileSize
} from '@/lib/utils/formatting';
import {
  isValidSaudiId,
  isValidIqamaNumber,
  isValidSaudiPhone,
  isValidEmail,
  isValidSaudiIban,
  isPositiveNumber,
  isInRange,
  isValidDate,
  isFutureDate,
  isNotEmpty
} from '@/lib/utils/validation';
import {
  groupBy,
  sortBy,
  chunk,
  unique,
  uniqueBy,
  sum,
  average
} from '@/lib/utils/arrays';
import { filterItems, paginateItems, getPaginationMeta } from '@/lib/filters';
import { formatDate, formatRelative, getDaysRemaining, daysBetween } from '@/lib/date';

export interface RealTestResult {
  id: string;
  testId: string;
  testName: string;
  name: string;
  category: string;
  status: 'passed' | 'failed';
  success: boolean;
  duration: number;
  input?: string;
  expected?: string;
  actual?: string;
  message: string;
}

let testCounter = 0;
const generateId = () => `real-lib-${++testCounter}-${Date.now()}`;

/**
 * تشغيل اختبار واحد
 */
function runTest(
  name: string,
  category: string,
  testFn: () => { passed: boolean; expected: string; actual: string; input?: string }
): RealTestResult {
  const start = performance.now();
  
  try {
    const result = testFn();
    return {
      id: generateId(),
      testId: `test-${name.replace(/\s+/g, '-')}`,
      testName: name,
      name,
      category,
      status: result.passed ? 'passed' : 'failed',
      success: result.passed,
      duration: performance.now() - start,
      input: result.input,
      expected: result.expected,
      actual: result.actual,
      message: result.passed ? '✅ نجح' : `❌ فشل: توقعنا ${result.expected} ولكن حصلنا على ${result.actual}`
    };
  } catch (error) {
    return {
      id: generateId(),
      testId: `test-${name.replace(/\s+/g, '-')}`,
      testName: name,
      name,
      category,
      status: 'failed',
      success: false,
      duration: performance.now() - start,
      message: `❌ خطأ: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}

/**
 * اختبارات دوال التنسيق
 */
function runFormattingTests(): RealTestResult[] {
  const results: RealTestResult[] = [];
  
  // اختبار formatCurrency
  results.push(runTest('formatCurrency - رقم موجب', 'التنسيق', () => {
    const result = formatCurrency(1500);
    const passed = result.includes('1') && result.includes('500');
    return { passed, expected: 'يحتوي على 1,500', actual: result, input: '1500' };
  }));
  
  results.push(runTest('formatCurrency - صفر', 'التنسيق', () => {
    const result = formatCurrency(0);
    const passed = result.includes('0');
    return { passed, expected: 'يحتوي على 0', actual: result, input: '0' };
  }));
  
  results.push(runTest('formatCurrency - رقم سالب', 'التنسيق', () => {
    const result = formatCurrency(-500);
    const passed = result.includes('500');
    return { passed, expected: 'يحتوي على 500', actual: result, input: '-500' };
  }));
  
  // اختبار formatNumber
  results.push(runTest('formatNumber - كسور', 'التنسيق', () => {
    const result = formatNumber(123.456, 2);
    const passed = result.includes('123') && result.includes('46');
    return { passed, expected: 'تقريب لمنزلتين', actual: result, input: '123.456' };
  }));
  
  // اختبار formatPercentage
  results.push(runTest('formatPercentage', 'التنسيق', () => {
    const result = formatPercentage(75.5, 1);
    const passed = result.includes('75') && result.includes('%');
    return { passed, expected: 'يحتوي على 75 و %', actual: result, input: '75.5' };
  }));
  
  // اختبار formatPhoneNumber
  results.push(runTest('formatPhoneNumber - رقم سعودي', 'التنسيق', () => {
    const result = formatPhoneNumber('0512345678');
    const passed = result.includes(' '); // يجب أن يكون مفصولاً
    return { passed, expected: 'رقم مفصول بمسافات', actual: result, input: '0512345678' };
  }));
  
  // اختبار formatNationalId
  results.push(runTest('formatNationalId', 'التنسيق', () => {
    const result = formatNationalId('1234567890');
    const passed = result.includes(' ');
    return { passed, expected: 'هوية مفصولة', actual: result, input: '1234567890' };
  }));
  
  // اختبار truncate
  results.push(runTest('truncate - نص طويل', 'التنسيق', () => {
    const result = truncate('هذا نص طويل جداً للاختبار', 10);
    const passed = result.length <= 13 && result.endsWith('...');
    return { passed, expected: 'نص مختصر مع ...', actual: result, input: 'هذا نص طويل جداً للاختبار' };
  }));
  
  results.push(runTest('truncate - نص قصير', 'التنسيق', () => {
    const input = 'نص قصير';
    const result = truncate(input, 50);
    const passed = result === input;
    return { passed, expected: input, actual: result, input };
  }));
  
  // اختبار formatFileSize
  results.push(runTest('formatFileSize - بايت', 'التنسيق', () => {
    const result = formatFileSize(500);
    const passed = result.includes('بايت');
    return { passed, expected: 'يحتوي على بايت', actual: result, input: '500' };
  }));
  
  results.push(runTest('formatFileSize - كيلوبايت', 'التنسيق', () => {
    const result = formatFileSize(1536);
    const passed = result.includes('كيلوبايت');
    return { passed, expected: 'يحتوي على كيلوبايت', actual: result, input: '1536' };
  }));
  
  results.push(runTest('formatFileSize - ميجابايت', 'التنسيق', () => {
    const result = formatFileSize(1048576);
    const passed = result.includes('ميجابايت');
    return { passed, expected: 'يحتوي على ميجابايت', actual: result, input: '1048576' };
  }));
  
  return results;
}

/**
 * اختبارات دوال التحقق
 */
function runValidationTests(): RealTestResult[] {
  const results: RealTestResult[] = [];
  
  // اختبار isValidSaudiId
  results.push(runTest('isValidSaudiId - هوية صحيحة', 'التحقق', () => {
    const result = isValidSaudiId('1234567890');
    return { passed: result === true, expected: 'true', actual: String(result), input: '1234567890' };
  }));
  
  results.push(runTest('isValidSaudiId - هوية خاطئة (قصيرة)', 'التحقق', () => {
    const result = isValidSaudiId('12345');
    return { passed: result === false, expected: 'false', actual: String(result), input: '12345' };
  }));
  
  results.push(runTest('isValidSaudiId - هوية تبدأ بـ 2', 'التحقق', () => {
    const result = isValidSaudiId('2123456789');
    return { passed: result === true, expected: 'true', actual: String(result), input: '2123456789' };
  }));
  
  results.push(runTest('isValidSaudiId - هوية تبدأ بـ 5 (خاطئة)', 'التحقق', () => {
    const result = isValidSaudiId('5123456789');
    return { passed: result === false, expected: 'false', actual: String(result), input: '5123456789' };
  }));
  
  // اختبار isValidIqamaNumber
  results.push(runTest('isValidIqamaNumber - إقامة صحيحة', 'التحقق', () => {
    const result = isValidIqamaNumber('3123456789');
    return { passed: result === true, expected: 'true', actual: String(result), input: '3123456789' };
  }));
  
  results.push(runTest('isValidIqamaNumber - إقامة تبدأ بـ 4', 'التحقق', () => {
    const result = isValidIqamaNumber('4123456789');
    return { passed: result === true, expected: 'true', actual: String(result), input: '4123456789' };
  }));
  
  // اختبار isValidSaudiPhone
  results.push(runTest('isValidSaudiPhone - رقم صحيح', 'التحقق', () => {
    const result = isValidSaudiPhone('0512345678');
    return { passed: result === true, expected: 'true', actual: String(result), input: '0512345678' };
  }));
  
  results.push(runTest('isValidSaudiPhone - رقم خاطئ', 'التحقق', () => {
    const result = isValidSaudiPhone('1234567890');
    return { passed: result === false, expected: 'false', actual: String(result), input: '1234567890' };
  }));
  
  // اختبار isValidEmail
  results.push(runTest('isValidEmail - بريد صحيح', 'التحقق', () => {
    const result = isValidEmail('test@example.com');
    return { passed: result === true, expected: 'true', actual: String(result), input: 'test@example.com' };
  }));
  
  results.push(runTest('isValidEmail - بريد خاطئ', 'التحقق', () => {
    const result = isValidEmail('invalid-email');
    return { passed: result === false, expected: 'false', actual: String(result), input: 'invalid-email' };
  }));
  
  // اختبار isValidSaudiIban
  results.push(runTest('isValidSaudiIban - آيبان صحيح', 'التحقق', () => {
    const result = isValidSaudiIban('SA0380000000608010167519');
    return { passed: result === true, expected: 'true', actual: String(result), input: 'SA0380000000608010167519' };
  }));
  
  results.push(runTest('isValidSaudiIban - آيبان قصير', 'التحقق', () => {
    const result = isValidSaudiIban('SA03800000006080');
    return { passed: result === false, expected: 'false', actual: String(result), input: 'SA03800000006080' };
  }));
  
  // اختبار isPositiveNumber
  results.push(runTest('isPositiveNumber - رقم موجب', 'التحقق', () => {
    const result = isPositiveNumber(5);
    return { passed: result === true, expected: 'true', actual: String(result), input: '5' };
  }));
  
  results.push(runTest('isPositiveNumber - صفر', 'التحقق', () => {
    const result = isPositiveNumber(0);
    return { passed: result === false, expected: 'false', actual: String(result), input: '0' };
  }));
  
  // اختبار isInRange
  results.push(runTest('isInRange - داخل النطاق', 'التحقق', () => {
    const result = isInRange(5, 1, 10);
    return { passed: result === true, expected: 'true', actual: String(result), input: '5 في [1,10]' };
  }));
  
  results.push(runTest('isInRange - خارج النطاق', 'التحقق', () => {
    const result = isInRange(15, 1, 10);
    return { passed: result === false, expected: 'false', actual: String(result), input: '15 في [1,10]' };
  }));
  
  // اختبار isValidDate
  results.push(runTest('isValidDate - تاريخ صحيح', 'التحقق', () => {
    const result = isValidDate('2024-01-15');
    return { passed: result === true, expected: 'true', actual: String(result), input: '2024-01-15' };
  }));
  
  results.push(runTest('isValidDate - تاريخ خاطئ', 'التحقق', () => {
    const result = isValidDate('invalid-date');
    return { passed: result === false, expected: 'false', actual: String(result), input: 'invalid-date' };
  }));
  
  // اختبار isNotEmpty
  results.push(runTest('isNotEmpty - نص غير فارغ', 'التحقق', () => {
    const result = isNotEmpty('مرحباً');
    return { passed: result === true, expected: 'true', actual: String(result), input: 'مرحباً' };
  }));
  
  results.push(runTest('isNotEmpty - نص فارغ', 'التحقق', () => {
    const result = isNotEmpty('   ');
    return { passed: result === false, expected: 'false', actual: String(result), input: '(مسافات فقط)' };
  }));
  
  return results;
}

/**
 * اختبارات دوال المصفوفات
 */
function runArrayTests(): RealTestResult[] {
  const results: RealTestResult[] = [];
  
  // اختبار groupBy
  results.push(runTest('groupBy - تجميع حسب الفئة', 'المصفوفات', () => {
    const items = [
      { name: 'أحمد', category: 'A' },
      { name: 'محمد', category: 'B' },
      { name: 'خالد', category: 'A' },
    ];
    const result = groupBy(items, 'category');
    const passed = result['A']?.length === 2 && result['B']?.length === 1;
    return { passed, expected: 'A=2, B=1', actual: `A=${result['A']?.length}, B=${result['B']?.length}`, input: '3 عناصر' };
  }));
  
  // اختبار sortBy
  results.push(runTest('sortBy - ترتيب تصاعدي', 'المصفوفات', () => {
    const items = [{ v: 3 }, { v: 1 }, { v: 2 }];
    const result = sortBy(items, 'v', 'asc');
    const passed = result[0].v === 1 && result[1].v === 2 && result[2].v === 3;
    return { passed, expected: '[1,2,3]', actual: result.map(i => i.v).join(','), input: '[3,1,2]' };
  }));
  
  results.push(runTest('sortBy - ترتيب تنازلي', 'المصفوفات', () => {
    const items = [{ v: 1 }, { v: 3 }, { v: 2 }];
    const result = sortBy(items, 'v', 'desc');
    const passed = result[0].v === 3 && result[1].v === 2 && result[2].v === 1;
    return { passed, expected: '[3,2,1]', actual: result.map(i => i.v).join(','), input: '[1,3,2]' };
  }));
  
  // اختبار chunk
  results.push(runTest('chunk - تقسيم مصفوفة', 'المصفوفات', () => {
    const arr = [1, 2, 3, 4, 5];
    const result = chunk(arr, 2);
    const passed = result.length === 3 && result[0].length === 2 && result[2].length === 1;
    return { passed, expected: '[[1,2],[3,4],[5]]', actual: JSON.stringify(result), input: '[1,2,3,4,5]' };
  }));
  
  // اختبار unique
  results.push(runTest('unique - إزالة المكررات', 'المصفوفات', () => {
    const arr = [1, 2, 2, 3, 3, 3];
    const result = unique(arr);
    const passed = result.length === 3;
    return { passed, expected: '[1,2,3]', actual: JSON.stringify(result), input: '[1,2,2,3,3,3]' };
  }));
  
  // اختبار uniqueBy
  results.push(runTest('uniqueBy - إزالة مكررات حسب مفتاح', 'المصفوفات', () => {
    const items = [{ id: 1, n: 'أ' }, { id: 2, n: 'ب' }, { id: 1, n: 'ج' }];
    const result = uniqueBy(items, 'id');
    const passed = result.length === 2;
    return { passed, expected: '2 عناصر', actual: `${result.length} عناصر`, input: '3 عناصر مع id مكرر' };
  }));
  
  // اختبار sum
  results.push(runTest('sum - مجموع الأرقام', 'المصفوفات', () => {
    const result = sum([1, 2, 3, 4, 5]);
    const passed = result === 15;
    return { passed, expected: '15', actual: String(result), input: '[1,2,3,4,5]' };
  }));
  
  // اختبار average
  results.push(runTest('average - متوسط الأرقام', 'المصفوفات', () => {
    const result = average([10, 20, 30]);
    const passed = result === 20;
    return { passed, expected: '20', actual: String(result), input: '[10,20,30]' };
  }));
  
  results.push(runTest('average - مصفوفة فارغة', 'المصفوفات', () => {
    const result = average([]);
    const passed = result === 0;
    return { passed, expected: '0', actual: String(result), input: '[]' };
  }));
  
  return results;
}

/**
 * اختبارات دوال الفلترة
 */
function runFilterTests(): RealTestResult[] {
  const results: RealTestResult[] = [];
  
  // اختبار filterItems
  results.push(runTest('filterItems - بحث نصي', 'الفلترة', () => {
    const items = [
      { name: 'أحمد علي', status: 'active' },
      { name: 'محمد خالد', status: 'active' },
      { name: 'سعد أحمد', status: 'inactive' },
    ];
    const result = filterItems(items, { searchQuery: 'أحمد' }, ['name']);
    const passed = result.length === 2;
    return { passed, expected: '2 نتائج', actual: `${result.length} نتائج`, input: 'بحث: أحمد' };
  }));
  
  results.push(runTest('filterItems - فلتر الحالة', 'الفلترة', () => {
    const items = [
      { name: 'أحمد', status: 'active' },
      { name: 'محمد', status: 'inactive' },
      { name: 'خالد', status: 'active' },
    ];
    const result = filterItems(items, { status: 'active' }, ['name']);
    const passed = result.length === 2;
    return { passed, expected: '2 نتائج', actual: `${result.length} نتائج`, input: 'status=active' };
  }));
  
  // اختبار paginateItems
  results.push(runTest('paginateItems - صفحة 1', 'الفلترة', () => {
    const items = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    const result = paginateItems(items, 1, 3);
    const passed = result.length === 3 && result[0] === 1;
    return { passed, expected: '[1,2,3]', actual: JSON.stringify(result), input: 'صفحة 1، حجم 3' };
  }));
  
  results.push(runTest('paginateItems - صفحة 2', 'الفلترة', () => {
    const items = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    const result = paginateItems(items, 2, 3);
    const passed = result.length === 3 && result[0] === 4;
    return { passed, expected: '[4,5,6]', actual: JSON.stringify(result), input: 'صفحة 2، حجم 3' };
  }));
  
  // اختبار getPaginationMeta
  results.push(runTest('getPaginationMeta - حساب الصفحات', 'الفلترة', () => {
    const result = getPaginationMeta(25, 2, 10);
    const passed = result.totalPages === 3 && result.hasNextPage === true && result.hasPreviousPage === true;
    return { 
      passed, 
      expected: 'totalPages=3, hasNext=true, hasPrev=true', 
      actual: `totalPages=${result.totalPages}, hasNext=${result.hasNextPage}, hasPrev=${result.hasPreviousPage}`,
      input: 'total=25, page=2, size=10'
    };
  }));
  
  return results;
}

/**
 * اختبارات دوال التاريخ
 */
function runDateTests(): RealTestResult[] {
  const results: RealTestResult[] = [];
  
  // اختبار formatDate
  results.push(runTest('formatDate - تنسيق أساسي', 'التاريخ', () => {
    const result = formatDate('2024-01-15');
    const passed = result.includes('15') && result.includes('01') && result.includes('2024');
    return { passed, expected: 'يحتوي على 15/01/2024', actual: result, input: '2024-01-15' };
  }));
  
  results.push(runTest('formatDate - تاريخ فارغ', 'التاريخ', () => {
    const result = formatDate(null);
    const passed = result === '';
    return { passed, expected: "''", actual: `'${result}'`, input: 'null' };
  }));
  
  // اختبار daysBetween
  results.push(runTest('daysBetween - حساب الأيام', 'التاريخ', () => {
    const result = daysBetween('2024-01-01', '2024-01-11');
    const passed = result === 10;
    return { passed, expected: '10', actual: String(result), input: '1 يناير إلى 11 يناير' };
  }));
  
  return results;
}

/**
 * اختبارات cn (classnames merger)
 */
function runCnTests(): RealTestResult[] {
  const results: RealTestResult[] = [];
  
  results.push(runTest('cn - دمج classes', 'الأدوات', () => {
    const result = cn('text-red-500', 'bg-blue-500');
    const passed = result.includes('text-red-500') && result.includes('bg-blue-500');
    return { passed, expected: 'text-red-500 bg-blue-500', actual: result, input: "cn('text-red-500', 'bg-blue-500')" };
  }));
  
  results.push(runTest('cn - تجاوز classes متعارضة', 'الأدوات', () => {
    const result = cn('text-red-500', 'text-blue-500');
    const passed = result === 'text-blue-500';
    return { passed, expected: 'text-blue-500', actual: result, input: "cn('text-red-500', 'text-blue-500')" };
  }));
  
  results.push(runTest('cn - شروط', 'الأدوات', () => {
    const result = cn('base', true && 'active', false && 'hidden');
    const passed = result.includes('base') && result.includes('active') && !result.includes('hidden');
    return { passed, expected: 'base active', actual: result, input: "cn('base', true && 'active', false && 'hidden')" };
  }));
  
  return results;
}

/**
 * تشغيل جميع الاختبارات الحقيقية
 */
export async function runRealLibTests(): Promise<RealTestResult[]> {
  console.log('🧪 بدء اختبارات المكتبات الحقيقية...');
  
  const allResults: RealTestResult[] = [];
  
  // تشغيل جميع فئات الاختبارات
  allResults.push(...runFormattingTests());
  allResults.push(...runValidationTests());
  allResults.push(...runArrayTests());
  allResults.push(...runFilterTests());
  allResults.push(...runDateTests());
  allResults.push(...runCnTests());
  
  // إحصائيات
  const passed = allResults.filter(r => r.success).length;
  const failed = allResults.filter(r => !r.success).length;
  
  console.log(`✅ اكتمل: ${passed} نجح، ${failed} فشل من ${allResults.length} اختبار`);
  
  return allResults;
}

export default runRealLibTests;
