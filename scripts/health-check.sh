#!/bin/bash

# 🏥 سكريبت فحص صحة البناء
# يقوم بفحص شامل للتطبيق والبحث عن مشاكل محتملة

echo "🔍 بدء فحص صحة التطبيق..."
echo "================================"

# ألوان للعرض
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# عداد الأخطاء
ERRORS=0
WARNINGS=0

# 1. فحص TypeScript
echo ""
echo "📝 فحص TypeScript..."
if npx tsc --noEmit > /dev/null 2>&1; then
    echo -e "${GREEN}✅ TypeScript: لا توجد أخطاء${NC}"
else
    echo -e "${RED}❌ TypeScript: توجد أخطاء${NC}"
    ERRORS=$((ERRORS + 1))
fi

# 2. فحص ESLint
echo ""
echo "🔍 فحص ESLint..."
if npm run lint > /dev/null 2>&1; then
    echo -e "${GREEN}✅ ESLint: لا توجد مشاكل${NC}"
else
    echo -e "${YELLOW}⚠️  ESLint: توجد تحذيرات${NC}"
    WARNINGS=$((WARNINGS + 1))
fi

# 3. البحث عن console.log في الكود
echo ""
echo "🔎 البحث عن console.log..."
CONSOLE_LOGS=$(grep -r "console\.log" src --include="*.ts" --include="*.tsx" --exclude-dir=__tests__ | wc -l)
if [ "$CONSOLE_LOGS" -eq 0 ]; then
    echo -e "${GREEN}✅ لا توجد console.log في الكود${NC}"
else
    echo -e "${YELLOW}⚠️  وجد $CONSOLE_LOGS console.log${NC}"
    WARNINGS=$((WARNINGS + 1))
fi

# 4. البحث عن TODO/FIXME
echo ""
echo "📋 البحث عن TODO/FIXME..."
TODOS=$(grep -r "TODO\|FIXME\|HACK" src --include="*.ts" --include="*.tsx" | wc -l)
if [ "$TODOS" -eq 0 ]; then
    echo -e "${GREEN}✅ لا توجد TODO/FIXME${NC}"
else
    echo -e "${YELLOW}⚠️  وجد $TODOS TODO/FIXME${NC}"
    WARNINGS=$((WARNINGS + 1))
fi

# 5. البحث عن استخدام any
echo ""
echo "🔍 البحث عن استخدام any..."
ANY_USAGE=$(grep -r ": any\|as any" src --include="*.ts" --include="*.tsx" --exclude-dir=__tests__ | wc -l)
if [ "$ANY_USAGE" -eq 0 ]; then
    echo -e "${GREEN}✅ لا يوجد استخدام مفرط لـ any${NC}"
else
    echo -e "${YELLOW}⚠️  وجد $ANY_USAGE استخدام لـ any${NC}"
    WARNINGS=$((WARNINGS + 1))
fi

# 6. فحص حجم Bundle
echo ""
echo "📦 فحص حجم Bundle..."
if npm run build > /dev/null 2>&1; then
    BUNDLE_SIZE=$(du -sh dist | cut -f1)
    echo -e "${GREEN}✅ Build نجح - الحجم: $BUNDLE_SIZE${NC}"
else
    echo -e "${RED}❌ Build فشل${NC}"
    ERRORS=$((ERRORS + 1))
fi

# 7. فحص Dependencies
echo ""
echo "📚 فحص Dependencies..."
if npm outdated > /dev/null 2>&1; then
    echo -e "${GREEN}✅ جميع المكتبات محدثة${NC}"
else
    echo -e "${YELLOW}⚠️  توجد مكتبات قديمة${NC}"
    WARNINGS=$((WARNINGS + 1))
fi

# 8. فحص Security Vulnerabilities
echo ""
echo "🔒 فحص الثغرات الأمنية..."
if npm audit --audit-level=high > /dev/null 2>&1; then
    echo -e "${GREEN}✅ لا توجد ثغرات أمنية خطيرة${NC}"
else
    echo -e "${RED}❌ توجد ثغرات أمنية${NC}"
    ERRORS=$((ERRORS + 1))
fi

# النتيجة النهائية
echo ""
echo "================================"
echo "📊 النتيجة النهائية:"
echo "================================"
echo ""

if [ "$ERRORS" -eq 0 ] && [ "$WARNINGS" -eq 0 ]; then
    echo -e "${GREEN}🎉 رائع! التطبيق في حالة ممتازة${NC}"
    echo -e "${GREEN}✅ 0 أخطاء، 0 تحذيرات${NC}"
    exit 0
elif [ "$ERRORS" -eq 0 ]; then
    echo -e "${YELLOW}⚠️  التطبيق جيد مع بعض التحذيرات${NC}"
    echo -e "${YELLOW}✅ 0 أخطاء، $WARNINGS تحذيرات${NC}"
    exit 0
else
    echo -e "${RED}❌ يوجد مشاكل تحتاج إصلاح${NC}"
    echo -e "${RED}❌ $ERRORS أخطاء، $WARNINGS تحذيرات${NC}"
    exit 1
fi
