#!/bin/bash

# 🔍 فحص تلقائي لاستخدام قيم severity الصحيحة في Edge Functions
# يُستخدم كبديل لسكريبت Node.js

echo "🔍 فحص توافق severity مع DB constraints..."

ERRORS=0

# فحص استخدام severity: 'info' مع system_alerts
SYSTEM_ALERTS_INFO=$(grep -rn "from.*system_alerts.*severity.*'info'\|from.*system_alerts.*severity.*\"info\"" supabase/functions/ --include="*.ts" 2>/dev/null)

if [ -n "$SYSTEM_ALERTS_INFO" ]; then
    echo "❌ خطأ: استخدام severity: 'info' مع system_alerts غير مسموح!"
    echo "$SYSTEM_ALERTS_INFO"
    ERRORS=$((ERRORS + 1))
fi

# فحص استخدام severity: 'info' مع system_error_logs
ERROR_LOGS_INFO=$(grep -rn "from.*system_error_logs.*severity.*'info'\|from.*system_error_logs.*severity.*\"info\"" supabase/functions/ --include="*.ts" 2>/dev/null)

if [ -n "$ERROR_LOGS_INFO" ]; then
    echo "❌ خطأ: استخدام severity: 'info' مع system_error_logs غير مسموح!"
    echo "$ERROR_LOGS_INFO"
    ERRORS=$((ERRORS + 1))
fi

if [ $ERRORS -eq 0 ]; then
    echo "✅ جميع قيم severity متوافقة مع DB constraints"
    exit 0
else
    echo ""
    echo "❌ فشل الفحص: $ERRORS أخطاء"
    echo "💡 الحل: استخدم 'low' بدلاً من 'info' للجداول: system_alerts, system_error_logs"
    exit 1
fi
