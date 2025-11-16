#!/bin/bash

# 🚀 سكريبت الفحص قبل النشر
# فحص شامل قبل نشر التطبيق للإنتاج

echo "🚀 فحص ما قبل النشر للإنتاج..."
echo "========================================"

# ألوان
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

PASSED=0
FAILED=0

# دالة للفحص
check() {
    local name=$1
    local command=$2
    
    echo ""
    echo -e "${BLUE}▶ فحص: $name${NC}"
    
    if eval "$command" > /dev/null 2>&1; then
        echo -e "${GREEN}  ✅ نجح${NC}"
        PASSED=$((PASSED + 1))
        return 0
    else
        echo -e "${RED}  ❌ فشل${NC}"
        FAILED=$((FAILED + 1))
        return 1
    fi
}

# قائمة الفحوصات
echo ""
echo "🔍 بدء الفحوصات..."

# 1. TypeScript
check "TypeScript Compilation" "npx tsc --noEmit"

# 2. ESLint
check "ESLint Check" "npm run lint"

# 3. Build Production
check "Production Build" "npm run build"

# 4. Tests E2E
check "E2E Tests" "npm run test:e2e"

# 5. Tests Integration
check "Integration Tests" "npm run test:integration"

# 6. Security Audit
check "Security Audit" "npm audit --audit-level=high"

# 7. Bundle Size Check
echo ""
echo -e "${BLUE}▶ فحص: Bundle Size${NC}"
if [ -d "dist" ]; then
    SIZE=$(du -sh dist | cut -f1)
    echo -e "${GREEN}  ✅ الحجم: $SIZE${NC}"
    PASSED=$((PASSED + 1))
else
    echo -e "${RED}  ❌ مجلد dist غير موجود${NC}"
    FAILED=$((FAILED + 1))
fi

# 8. Environment Variables
echo ""
echo -e "${BLUE}▶ فحص: Environment Variables${NC}"
if [ -f ".env" ]; then
    echo -e "${GREEN}  ✅ ملف .env موجود${NC}"
    PASSED=$((PASSED + 1))
else
    echo -e "${RED}  ❌ ملف .env غير موجود${NC}"
    FAILED=$((FAILED + 1))
fi

# 9. Supabase Connection
echo ""
echo -e "${BLUE}▶ فحص: Supabase Connection${NC}"
if grep -q "VITE_SUPABASE_URL" .env && grep -q "VITE_SUPABASE_PUBLISHABLE_KEY" .env; then
    echo -e "${GREEN}  ✅ إعدادات Supabase موجودة${NC}"
    PASSED=$((PASSED + 1))
else
    echo -e "${RED}  ❌ إعدادات Supabase ناقصة${NC}"
    FAILED=$((FAILED + 1))
fi

# 10. PWA Configuration
echo ""
echo -e "${BLUE}▶ فحص: PWA Configuration${NC}"
if [ -f "public/service-worker.js" ] && [ -f "public/pwa-icon-512.png" ]; then
    echo -e "${GREEN}  ✅ PWA جاهز${NC}"
    PASSED=$((PASSED + 1))
else
    echo -e "${YELLOW}  ⚠️  PWA غير مكتمل${NC}"
    FAILED=$((FAILED + 1))
fi

# النتيجة النهائية
echo ""
echo "========================================"
echo "📊 ملخص النتائج:"
echo "========================================"
echo ""
echo -e "✅ نجح: ${GREEN}$PASSED${NC} فحص"
echo -e "❌ فشل: ${RED}$FAILED${NC} فحص"
echo ""

TOTAL=$((PASSED + FAILED))
PERCENTAGE=$((PASSED * 100 / TOTAL))

echo -e "📈 النسبة: ${BLUE}$PERCENTAGE%${NC}"
echo ""

if [ "$FAILED" -eq 0 ]; then
    echo -e "${GREEN}┌─────────────────────────────────────┐${NC}"
    echo -e "${GREEN}│  🎉 جاهز للنشر! جميع الفحوصات نجحت  │${NC}"
    echo -e "${GREEN}└─────────────────────────────────────┘${NC}"
    echo ""
    echo -e "${GREEN}✅ يمكنك الآن نشر التطبيق بأمان${NC}"
    exit 0
else
    echo -e "${RED}┌─────────────────────────────────────┐${NC}"
    echo -e "${RED}│  ⚠️  غير جاهز للنشر - يوجد مشاكل    │${NC}"
    echo -e "${RED}└─────────────────────────────────────┘${NC}"
    echo ""
    echo -e "${RED}❌ الرجاء إصلاح المشاكل قبل النشر${NC}"
    exit 1
fi
