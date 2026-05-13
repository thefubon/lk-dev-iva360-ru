#!/usr/bin/env bash
# =============================================================================
# IVA 360 — полная проверка репозитория (prepare, ESLint, typecheck, vitest, build)
#
#   pnpm verify
#   bash scripts/verify.sh
#
# Без production build:
#   VERIFY_SKIP_BUILD=1 pnpm verify
# =============================================================================
set -o pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_ROOT" || exit 1

if [[ -t 1 ]]; then
  B='\033[1m' DIM='\033[2m' R='\033[0m'
  G='\033[0;32m' Y='\033[0;33m' M='\033[0;35m' C='\033[0;36m' RED='\033[0;31m'
else
  B='' DIM='' R='' G='' Y='' M='' C='' RED=''
fi

W=72
rule() { printf "${C}%*s${R}\n" "$W" '' | tr ' ' '─'; }

banner() {
  rule
  printf '%s%s%s\n' "$B" "$1" "$R"
  rule
}

# name | status | seconds | tail_note
RESULTS=()
FAILURES=0
T_ALL=$SECONDS

record() {
  local name="$1" status="$2" sec="$3" note="$4"
  RESULTS+=("${status}|${name}|${sec}|${note}")
}

run_step() {
  local name="$1"
  shift
  local t0=$SECONDS
  local log
  log="$(mktemp)"
  printf '\n%s▸ %s%s\n' "$M" "$name" "$R"
  if "$@" >"$log" 2>&1; then
    local dur=$((SECONDS - t0))
    local tail=""
    tail="$(grep -E 'Test Files|Tests |built in|Build complete|Nuxt Nitro|Types generated' "$log" 2>/dev/null | tail -3 | sed 's/^/      /' || true)"
    printf '  %s✓%s %s %s(%ss)%s\n' "$G" "$R" "$name" "$DIM" "$dur" "$R"
    [[ -n "$tail" ]] && printf '%s\n' "$tail"
    record "$name" "OK" "$dur" ""
    rm -f "$log"
    return 0
  else
    local ec=$?
    local dur=$((SECONDS - t0))
    printf '  %s✗%s %s %s(%ss, exit %s)%s\n' "$RED" "$R" "$name" "$DIM" "$dur" "$ec" "$R"
    tail -40 "$log" | sed "s/^/      ${RED}/" | sed "s/$/${R}/"
    record "$name" "FAIL" "$dur" "exit $ec"
    rm -f "$log"
    FAILURES=$((FAILURES + 1))
    return "$ec"
  fi
}

run_eslint() {
  local name="eslint ."
  local t0=$SECONDS
  local log
  log="$(mktemp)"
  printf '\n%s▸ %s%s\n' "$M" "$name" "$R"
  pnpm exec eslint . >"$log" 2>&1
  local ec=$?
  local dur=$((SECONDS - t0))
  local hint=""
  hint="$(grep -E '✖ [0-9]+ problem' "$log" | tail -1 || true)"
  if [[ $ec -eq 0 ]]; then
    printf '  %s✓%s %s %s(%ss)%s\n' "$G" "$R" "$name" "$DIM" "$dur" "$R"
    [[ -n "$hint" ]] && printf '      %s%s%s\n' "$DIM" "$hint" "$R"
    record "$name" "OK" "$dur" "${hint:-ok}"
  else
    printf '  %s✗%s %s %s(%ss)%s\n' "$RED" "$R" "$name" "$DIM" "$dur" "$R"
    tail -35 "$log" | sed "s/^/      ${RED}/" | sed "s/$/${R}/"
    record "$name" "FAIL" "$dur" "eslint exit $ec"
    FAILURES=$((FAILURES + 1))
  fi
  rm -f "$log"
  return "$ec"
}

banner " IVA 360 · verify "

printf '\n%sКаталог:%s %s\n' "$DIM" "$R" "$REPO_ROOT"
printf '%sNode:%s %s   %spnpm:%s %s\n' "$DIM" "$R" "$(node -v 2>/dev/null || echo '?')" "$DIM" "$R" "$(pnpm -v 2>/dev/null || echo '?')"

run_step "nuxt prepare" pnpm exec nuxt prepare || true
run_eslint || true
run_step "nuxi typecheck" pnpm exec nuxi typecheck || true
run_step "vitest run" pnpm exec vitest run || true

if [[ "${VERIFY_SKIP_BUILD:-}" == "1" ]]; then
  printf '\n%s▸ nuxt build%s\n' "$M" "$R"
  printf '  %s○%s %s %s(VERIFY_SKIP_BUILD=1)%s\n' "$Y" "$R" "nuxt build" "$DIM" "$R"
  record "nuxt build" "SKIP" "—" "VERIFY_SKIP_BUILD"
else
  run_step "nuxt build" pnpm run build || true
fi

TOTAL=$((SECONDS - T_ALL))

printf '\n'
rule
printf '%s%s Итого %ss · шагов с ошибкой: %s%s\n' "$B" "$C" "$TOTAL" "$FAILURES" "$R"
rule

printf '\n%s%-8s  %-22s  %-8s  %s%s\n' "$B" "Статус" "Шаг" "Время" "Примечание" "$R"
printf '%s\n' "$(printf '─%.0s' $(seq 1 72))"
for _r in "${RESULTS[@]}"; do
  IFS='|' read -r st name sec note <<<"$_r"
  case "$st" in
    OK)   stc="${G}${B} OK ${R}" ;;
    FAIL) stc="${RED}${B} FAIL ${R}" ;;
    SKIP) stc="${Y}${B} SKIP ${R}" ;;
    *)    stc="$st" ;;
  esac
  printf '%b  %-22s  %-8s  %s\n' "$stc" "$name" "${sec}" "${note:-}"
done

printf '\n'
if [[ $FAILURES -eq 0 ]]; then
  printf '%s%s Все шаги прошли успешно.%s\n' "$G" "$B" "$R"
  exit 0
fi

printf '%s%s Проверка не пройдена (%s сбоев).%s\n' "$RED" "$B" "$FAILURES" "$R"
exit 1
