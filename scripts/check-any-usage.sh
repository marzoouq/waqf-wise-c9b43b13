#!/bin/bash

# Script to check for any usage in the project

echo "=== Checking for 'any' usage in the project ==="
echo ""

# Check for ': any)' in hooks
echo "1. Checking for ': any)' in hooks..."
ANY_HOOKS=$(grep -r ": any)" src/hooks/ --exclude-dir=__tests__ 2>/dev/null | wc -l)
echo "   Found: $ANY_HOOKS instances in hooks"

# Check for 'as any' in components
echo "2. Checking for 'as any' in components..."
AS_ANY_COMPONENTS=$(grep -r "as any" src/components/ --exclude-dir=__tests__ 2>/dev/null | wc -l)
echo "   Found: $AS_ANY_COMPONENTS instances in components"

# Check for 'error: any' everywhere
echo "3. Checking for 'error: any'..."
ERROR_ANY=$(grep -r "error: any" src/ --exclude-dir=__tests__ --exclude-dir=node_modules 2>/dev/null | wc -l)
echo "   Found: $ERROR_ANY instances"

# Total
TOTAL=$((ANY_HOOKS + AS_ANY_COMPONENTS + ERROR_ANY))
echo ""
echo "=== Total 'any' usages: $TOTAL ==="

if [ $TOTAL -eq 0 ]; then
  echo "✅ Perfect! No 'any' usage found!"
  exit 0
else
  echo "⚠️  Still have $TOTAL 'any' usages to clean"
  exit 1
fi
