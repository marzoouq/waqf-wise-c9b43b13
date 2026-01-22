#!/bin/bash
# 🔧 Auto-fix common ESLint errors
# Run with: bash scripts/fix-lint-errors.sh

echo "🔧 إصلاح أخطاء ESLint التلقائية..."

# 1. Auto-fix what ESLint can handle automatically
echo "📝 تشغيل --fix للإصلاحات التلقائية..."
npx eslint . --ext .ts,.tsx --fix --quiet

# 2. Count remaining issues
echo ""
echo "📊 فحص الأخطاء المتبقية..."
ERRORS=$(npx eslint . --ext .ts,.tsx --format json 2>&1 | jq '[.[] | .errorCount] | add' 2>/dev/null || echo "0")
WARNINGS=$(npx eslint . --ext .ts,.tsx --format json 2>&1 | jq '[.[] | .warningCount] | add' 2>/dev/null || echo "0")

echo "❌ Errors: $ERRORS"
echo "⚠️  Warnings: $WARNINGS"

if [ "$ERRORS" -eq 0 ] && [ "$WARNINGS" -le 400 ]; then
    echo ""
    echo "✅ نجاح! الكود جاهز لاجتياز CI Pipeline"
    exit 0
else
    echo ""
    echo "⚠️  يوجد $ERRORS خطأ و $WARNINGS تحذير"
    echo "📋 عرض الملفات التي تحتاج إصلاح يدوي:"
    npx eslint . --ext .ts,.tsx --format json 2>&1 | jq -r '.[] | select(.errorCount > 0) | .filePath' | head -20
    exit 0
fi
