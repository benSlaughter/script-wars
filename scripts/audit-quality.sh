#!/usr/bin/env bash
set -euo pipefail

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'
FAILED=0

section() { echo -e "\n${YELLOW}━━━ $1 ━━━${NC}"; }
pass() { echo -e "  ${GREEN}✓${NC} $1"; }
fail() { echo -e "  ${RED}✗${NC} $1"; FAILED=1; }

section "ESLint"
if npx eslint . 2>&1; then
  pass "No lint errors"
else
  fail "Lint errors found"
fi

section "Prettier"
if npx prettier --check . 2>&1; then
  pass "All files formatted"
else
  fail "Formatting issues found — run 'npx prettier --write .'"
fi

section "Svelte Check (TypeScript)"
if npx svelte-check --tsconfig ./tsconfig.json 2>&1; then
  pass "No type errors"
else
  fail "Type errors found"
fi

section "Tests"
if npx vitest run 2>&1; then
  pass "All tests passed"
else
  fail "Test failures"
fi

echo ""
if [ $FAILED -eq 0 ]; then
  echo -e "${GREEN}✅ Quality audit passed${NC}"
else
  echo -e "${RED}❌ Quality audit found issues — review above${NC}"
  exit 1
fi
