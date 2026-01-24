#!/bin/bash

# ============================================================
# سكريبت إحصاء أخطاء TypeScript Strict Mode
# يُستخدم لقياس التقدم في تفعيل Strict Mode
# ============================================================

echo "🔍 فحص أخطاء TypeScript Strict Mode..."
echo "================================================"

# التحقق من وجود ملف الفحص
if [ ! -f "tsconfig.strict-check.json" ]; then
    echo "❌ ملف tsconfig.strict-check.json غير موجود!"
    echo "💡 أنشئ الملف أولاً"
    exit 1
fi

# تشغيل الفحص وحفظ النتائج
echo "⏳ جاري تشغيل TypeScript compiler..."
npx tsc -p tsconfig.strict-check.json 2>&1 | tee .strict-errors.log

# إحصاء الأخطاء
TOTAL_ERRORS=$(grep -c "error TS" .strict-errors.log 2>/dev/null || echo "0")
NULL_ERRORS=$(grep -c "possibly 'null'" .strict-errors.log 2>/dev/null || echo "0")
UNDEFINED_ERRORS=$(grep -c "possibly 'undefined'" .strict-errors.log 2>/dev/null || echo "0")
ANY_ERRORS=$(grep -c "implicitly has.*'any'" .strict-errors.log 2>/dev/null || echo "0")
RETURN_ERRORS=$(grep -c "Function lacks ending return" .strict-errors.log 2>/dev/null || echo "0")

echo ""
echo "📊 ملخص الأخطاء:"
echo "================================================"
echo "❌ إجمالي الأخطاء:        $TOTAL_ERRORS"
echo "🔸 أخطاء null:           $NULL_ERRORS"
echo "🔸 أخطاء undefined:      $UNDEFINED_ERRORS"
echo "🔸 أخطاء any ضمنية:      $ANY_ERRORS"
echo "🔸 أخطاء return:         $RETURN_ERRORS"
echo "================================================"

# تصنيف حسب الملفات
echo ""
echo "📁 الملفات الأكثر أخطاء (Top 10):"
echo "================================================"
grep "error TS" .strict-errors.log | cut -d'(' -f1 | sort | uniq -c | sort -rn | head -10

# تصنيف حسب نوع الخطأ
echo ""
echo "🏷️ أنواع الأخطاء الأكثر شيوعاً:"
echo "================================================"
grep -oP "error TS\d+" .strict-errors.log | sort | uniq -c | sort -rn | head -10

# حفظ التقرير
REPORT_FILE="strict-mode-report-$(date +%Y%m%d-%H%M%S).txt"
echo ""
echo "💾 حفظ التقرير في: $REPORT_FILE"
{
    echo "TypeScript Strict Mode Report"
    echo "Generated: $(date)"
    echo "================================================"
    echo "Total Errors: $TOTAL_ERRORS"
    echo "Null Errors: $NULL_ERRORS"
    echo "Undefined Errors: $UNDEFINED_ERRORS"
    echo "Implicit Any Errors: $ANY_ERRORS"
    echo "Return Errors: $RETURN_ERRORS"
    echo ""
    echo "Full error log saved in: .strict-errors.log"
} > "$REPORT_FILE"

# تنظيف
# rm -f .strict-errors.log

echo ""
if [ "$TOTAL_ERRORS" -eq 0 ]; then
    echo "✅ مبروك! لا توجد أخطاء - يمكن تفعيل Strict Mode!"
    exit 0
elif [ "$TOTAL_ERRORS" -lt 100 ]; then
    echo "🟡 عدد قليل من الأخطاء - يمكن إصلاحها بسهولة"
    exit 0
elif [ "$TOTAL_ERRORS" -lt 500 ]; then
    echo "🟠 عدد متوسط من الأخطاء - يحتاج خطة مرحلية"
    exit 0
else
    echo "🔴 عدد كبير من الأخطاء - يحتاج خطة طويلة المدى"
    exit 1
fi
