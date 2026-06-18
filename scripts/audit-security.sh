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

section "Dependency Vulnerability Scan"
if npm audit --omit=dev 2>/dev/null; then
  pass "No production dependency vulnerabilities"
else
  fail "Dependency vulnerabilities found — run 'npm audit' for details"
fi

section "Hardcoded Secrets Check"
SECRETS_PATTERN='(password|secret|api_key|token|private_key)\s*[:=]\s*["\x27][^"\x27]{8,}'
if grep -riE "$SECRETS_PATTERN" src/ --include='*.ts' --include='*.svelte' --include='*.js' \
   | grep -v 'type.*password' \
   | grep -v 'autocomplete' \
   | grep -v 'label.*password' \
   | grep -v 'minPasswordLength' \
   | grep -v '\.test\.' \
   | grep -v 'TODO' 2>/dev/null; then
  fail "Potential hardcoded secrets found (review above)"
else
  pass "No hardcoded secrets detected"
fi

section "Auth Middleware Coverage"
if [ -f src/hooks.server.ts ]; then
  if grep -q 'svelteKitHandler\|handle' src/hooks.server.ts; then
    pass "Auth hook registered in hooks.server.ts"
  else
    fail "hooks.server.ts exists but no auth handler found"
  fi
else
  fail "No hooks.server.ts — auth middleware may not be active"
fi

section "Environment Files Check"
if [ -f .env ] && grep -qiE '(secret|password|key|token)' .env 2>/dev/null; then
  if grep -q '.env' .gitignore 2>/dev/null; then
    pass ".env is gitignored"
  else
    fail ".env contains secrets but is NOT in .gitignore"
  fi
else
  pass "No exposed .env secrets"
fi

section "SQL Injection Prevention"
UNSAFE_SQL='(db\.run|db\.exec|db\.prepare)\s*\(\s*`'
if grep -rE "$UNSAFE_SQL" src/ --include='*.ts' --include='*.js' 2>/dev/null; then
  fail "Potential raw SQL with template literals found (use parameterized queries)"
else
  pass "No raw SQL template literals detected — using ORM/parameterized queries"
fi

echo ""
if [ $FAILED -eq 0 ]; then
  echo -e "${GREEN}✅ Security audit passed${NC}"
else
  echo -e "${RED}❌ Security audit found issues — review above${NC}"
  exit 1
fi
