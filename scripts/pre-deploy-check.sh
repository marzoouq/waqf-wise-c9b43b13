#!/bin/bash

# ═══════════════════════════════════════════════════════════════════════════════
# 🚀 سكريبت الفحص الشامل قبل النشر
# Comprehensive Pre-Deploy Validation Script
# ═══════════════════════════════════════════════════════════════════════════════
# 
# الاستخدام: ./scripts/pre-deploy-check.sh [--skip-tests] [--verbose]
# 
# الخيارات:
#   --skip-tests    تخطي اختبارات E2E والتكامل (أسرع)
#   --verbose       عرض تفاصيل أكثر
#
# ═══════════════════════════════════════════════════════════════════════════════

set -e

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# الإعدادات والمتغيرات
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

# ألوان
readonly GREEN='\033[0;32m'
readonly RED='\033[0;31m'
readonly YELLOW='\033[1;33m'
readonly BLUE='\033[0;34m'
readonly CYAN='\033[0;36m'
readonly BOLD='\033[1m'
readonly NC='\033[0m'

# متغيرات الحالة
PASSED=0
FAILED=0
WARNINGS=0
SKIPPED=0
START_TIME=$(date +%s)

# خيارات
SKIP_TESTS=false
VERBOSE=false

# معالجة الخيارات
for arg in "$@"; do
    case $arg in
        --skip-tests) SKIP_TESTS=true ;;
        --verbose) VERBOSE=true ;;
        --help) 
            echo "Usage: $0 [--skip-tests] [--verbose]"
            exit 0 
            ;;
    esac
done

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# دوال المساعدة
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

print_header() {
    echo ""
    echo -e "${CYAN}═══════════════════════════════════════════════════════════════${NC}"
    echo -e "${BOLD}${CYAN} $1${NC}"
    echo -e "${CYAN}═══════════════════════════════════════════════════════════════${NC}"
}

print_stage() {
    echo ""
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BOLD}${BLUE} 🔷 المرحلة $1: $2${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
}

check() {
    local name=$1
    local command=$2
    local is_critical=${3:-true}
    
    echo -e "\n${BLUE}▶ ${NC}${BOLD}$name${NC}"
    
    if $VERBOSE; then
        echo -e "  ${CYAN}Command: $command${NC}"
    fi
    
    local output
    local exit_code
    
    if output=$(eval "$command" 2>&1); then
        echo -e "  ${GREEN}✅ نجح${NC}"
        PASSED=$((PASSED + 1))
        return 0
    else
        exit_code=$?
        if [ "$is_critical" = true ]; then
            echo -e "  ${RED}❌ فشل (critical)${NC}"
            if $VERBOSE; then
                echo -e "  ${RED}Output: $output${NC}"
            fi
            FAILED=$((FAILED + 1))
            return 1
        else
            echo -e "  ${YELLOW}⚠️  تحذير (غير حرج)${NC}"
            WARNINGS=$((WARNINGS + 1))
            return 0
        fi
    fi
}

check_file() {
    local file=$1
    local description=$2
    
    echo -e "\n${BLUE}▶ ${NC}${BOLD}$description${NC}"
    
    if [ -f "$file" ]; then
        echo -e "  ${GREEN}✅ موجود: $file${NC}"
        PASSED=$((PASSED + 1))
        return 0
    else
        echo -e "  ${YELLOW}⚠️  غير موجود: $file${NC}"
        WARNINGS=$((WARNINGS + 1))
        return 0
    fi
}

check_env_var() {
    local var_name=$1
    local description=$2
    
    echo -e "\n${BLUE}▶ ${NC}${BOLD}$description${NC}"
    
    if [ -f ".env" ] && grep -q "^$var_name=" .env 2>/dev/null; then
        echo -e "  ${GREEN}✅ متغير $var_name موجود${NC}"
        PASSED=$((PASSED + 1))
        return 0
    else
        echo -e "  ${YELLOW}⚠️  متغير $var_name غير موجود${NC}"
        WARNINGS=$((WARNINGS + 1))
        return 0
    fi
}

skip_check() {
    local name=$1
    echo -e "\n${BLUE}▶ ${NC}${BOLD}$name${NC}"
    echo -e "  ${YELLOW}⏭️  تم التخطي${NC}"
    SKIPPED=$((SKIPPED + 1))
}

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# بداية الفحوصات
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

print_header "🚀 فحص ما قبل النشر للإنتاج"

echo -e "\n${CYAN}📅 التاريخ: $(date '+%Y-%m-%d %H:%M:%S')${NC}"
echo -e "${CYAN}📁 المجلد: $(pwd)${NC}"
if $SKIP_TESTS; then
    echo -e "${YELLOW}⚠️  وضع التخطي: الاختبارات معطلة${NC}"
fi

# ═══════════════════════════════════════════════════════════════════════════════
# المرحلة 1: فحوصات الكود
# ═══════════════════════════════════════════════════════════════════════════════

print_stage "1/6" "فحوصات الكود (Code Quality)"

check "TypeScript Compilation" "npx tsc --noEmit" true
check "ESLint Check (Strict)" "npm run lint 2>/dev/null || npx eslint . --ext .ts,.tsx --max-warnings=0" true
check "Prettier Check" "npx prettier --check 'src/**/*.{ts,tsx,css}' 2>/dev/null" false

# ═══════════════════════════════════════════════════════════════════════════════
# المرحلة 2: فحوصات البناء
# ═══════════════════════════════════════════════════════════════════════════════

print_stage "2/6" "فحوصات البناء (Build)"

check "Production Build" "npm run build" true

# فحص حجم البناء
echo -e "\n${BLUE}▶ ${NC}${BOLD}Bundle Size Analysis${NC}"
if [ -d "dist" ]; then
    SIZE=$(du -sh dist | cut -f1)
    SIZE_BYTES=$(du -sb dist | cut -f1)
    MAX_SIZE=$((50 * 1024 * 1024))  # 50MB
    
    echo -e "  ${CYAN}📦 حجم البناء: $SIZE${NC}"
    
    if [ "$SIZE_BYTES" -lt "$MAX_SIZE" ]; then
        echo -e "  ${GREEN}✅ الحجم ضمن الحد المسموح${NC}"
        PASSED=$((PASSED + 1))
    else
        echo -e "  ${YELLOW}⚠️  الحجم كبير جداً (> 50MB)${NC}"
        WARNINGS=$((WARNINGS + 1))
    fi
else
    echo -e "  ${RED}❌ مجلد dist غير موجود${NC}"
    FAILED=$((FAILED + 1))
fi

# ═══════════════════════════════════════════════════════════════════════════════
# المرحلة 3: الاختبارات
# ═══════════════════════════════════════════════════════════════════════════════

print_stage "3/6" "الاختبارات (Tests)"

if $SKIP_TESTS; then
    skip_check "Unit Tests"
    skip_check "Integration Tests"
    skip_check "E2E Tests"
else
    check "Unit Tests" "npm run test:unit 2>/dev/null || npm test -- --run 2>/dev/null" false
    check "Integration Tests" "npm run test:integration 2>/dev/null" false
    check "E2E Tests" "npm run test:e2e 2>/dev/null" false
fi

# ═══════════════════════════════════════════════════════════════════════════════
# المرحلة 4: فحوصات الأمان
# ═══════════════════════════════════════════════════════════════════════════════

print_stage "4/6" "فحوصات الأمان (Security)"

check "npm Audit (High)" "npm audit --audit-level=high 2>/dev/null" false
check "npm Audit (Critical)" "npm audit --audit-level=critical 2>/dev/null" true

# فحص الملفات الحساسة
echo -e "\n${BLUE}▶ ${NC}${BOLD}Sensitive Files Check${NC}"
SENSITIVE_PATTERNS=(".env.local" ".env.production" "*.pem" "*.key" "secrets.json")
FOUND_SENSITIVE=false

for pattern in "${SENSITIVE_PATTERNS[@]}"; do
    if ls $pattern 2>/dev/null | grep -q .; then
        echo -e "  ${YELLOW}⚠️  ملف حساس موجود: $pattern${NC}"
        FOUND_SENSITIVE=true
    fi
done

if ! $FOUND_SENSITIVE; then
    echo -e "  ${GREEN}✅ لا توجد ملفات حساسة مكشوفة${NC}"
    PASSED=$((PASSED + 1))
else
    WARNINGS=$((WARNINGS + 1))
fi

# ═══════════════════════════════════════════════════════════════════════════════
# المرحلة 5: فحوصات البيئة
# ═══════════════════════════════════════════════════════════════════════════════

print_stage "5/6" "فحوصات البيئة (Environment)"

check_file ".env" "ملف البيئة"
check_env_var "VITE_SUPABASE_URL" "Supabase URL"
check_env_var "VITE_SUPABASE_PUBLISHABLE_KEY" "Supabase Key"

# فحص PWA
echo -e "\n${BLUE}▶ ${NC}${BOLD}PWA Configuration${NC}"
PWA_READY=true
if [ ! -f "public/manifest.json" ] && [ ! -f "manifest.json" ]; then
    echo -e "  ${YELLOW}⚠️  manifest.json غير موجود${NC}"
    PWA_READY=false
fi
if [ ! -f "public/pwa-icon-512.png" ] && [ ! -f "public/icon-512.png" ]; then
    echo -e "  ${YELLOW}⚠️  PWA icon غير موجود${NC}"
    PWA_READY=false
fi

if $PWA_READY; then
    echo -e "  ${GREEN}✅ PWA جاهز${NC}"
    PASSED=$((PASSED + 1))
else
    WARNINGS=$((WARNINGS + 1))
fi

# ═══════════════════════════════════════════════════════════════════════════════
# المرحلة 6: فحوصات قاعدة البيانات
# ═══════════════════════════════════════════════════════════════════════════════

print_stage "6/6" "فحوصات قاعدة البيانات (Database)"

check_file "scripts/check-severity-constraints.js" "سكريبت فحص Severity"
check_file "scripts/check-column-names.js" "سكريبت فحص أسماء الأعمدة"

if [ -f "scripts/check-severity-constraints.js" ]; then
    check "DB Severity Constraints" "node scripts/check-severity-constraints.js 2>/dev/null" false
fi

if [ -f "scripts/check-column-names.js" ]; then
    check "DB Column Names" "node scripts/check-column-names.js 2>/dev/null" false
fi

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# النتيجة النهائية
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

END_TIME=$(date +%s)
DURATION=$((END_TIME - START_TIME))
MINUTES=$((DURATION / 60))
SECONDS=$((DURATION % 60))

print_header "📊 ملخص النتائج"

echo ""
echo -e "  ${GREEN}✅ نجح:${NC}     $PASSED فحص"
echo -e "  ${RED}❌ فشل:${NC}     $FAILED فحص"
echo -e "  ${YELLOW}⚠️  تحذير:${NC}  $WARNINGS فحص"
echo -e "  ${CYAN}⏭️  تخطي:${NC}   $SKIPPED فحص"
echo ""
echo -e "  ${CYAN}⏱️  الوقت:${NC}   ${MINUTES}m ${SECONDS}s"
echo ""

TOTAL=$((PASSED + FAILED))
if [ "$TOTAL" -gt 0 ]; then
    PERCENTAGE=$((PASSED * 100 / TOTAL))
    echo -e "  ${CYAN}📈 النسبة:${NC}  $PERCENTAGE%"
fi

echo ""

if [ "$FAILED" -eq 0 ]; then
    echo -e "${GREEN}┌─────────────────────────────────────────────────────────────────┐${NC}"
    echo -e "${GREEN}│                                                                 │${NC}"
    echo -e "${GREEN}│   🎉  جاهز للنشر!                                               │${NC}"
    echo -e "${GREEN}│       جميع الفحوصات الحرجة نجحت                                 │${NC}"
    echo -e "${GREEN}│                                                                 │${NC}"
    echo -e "${GREEN}└─────────────────────────────────────────────────────────────────┘${NC}"
    echo ""
    
    if [ "$WARNINGS" -gt 0 ]; then
        echo -e "${YELLOW}💡 ملاحظة: يوجد $WARNINGS تحذيرات غير حرجة${NC}"
    fi
    
    exit 0
else
    echo -e "${RED}┌─────────────────────────────────────────────────────────────────┐${NC}"
    echo -e "${RED}│                                                                 │${NC}"
    echo -e "${RED}│   ⛔  غير جاهز للنشر!                                           │${NC}"
    echo -e "${RED}│       يوجد $FAILED فحوصات حرجة فاشلة                             │${NC}"
    echo -e "${RED}│                                                                 │${NC}"
    echo -e "${RED}└─────────────────────────────────────────────────────────────────┘${NC}"
    echo ""
    echo -e "${RED}❌ الرجاء إصلاح المشاكل الحرجة قبل النشر${NC}"
    exit 1
fi
