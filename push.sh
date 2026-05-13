#!/usr/bin/env bash
# =============================================================================
# IVA 360 — проверки + обратный отсчёт + безопасный git push
#
#   ./push.sh              # push на origin текущей ветки
#   ./push.sh upstream     # push на remote upstream
#
# Переменные:
#   VERIFY_SKIP_BUILD=1 ./push.sh   — без nuxt build
#   PUSH_SKIP_COUNTDOWN=1 ./push.sh — без отсчёта (сразу вопрос)
# =============================================================================
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT" || exit 1

REMOTE="${1:-origin}"

if [[ -t 1 ]]; then
  B='\033[1m' DIM='\033[2m' R='\033[0m'
  G='\033[0;32m' C='\033[0;36m' M='\033[0;35m' Y='\033[0;33m' RED='\033[0;31m'
else
  B='' DIM='' R='' G='' C='' M='' Y='' RED=''
fi

if ! git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  printf '%sНе git-репозиторий.%s\n' "$RED" "$R"
  exit 1
fi

BRANCH="$(git branch --show-current 2>/dev/null || echo '?')"

banner() {
  printf '\n%s' "$C"
  printf '═%.0s' {1..60}; printf '%s\n' "$R"
  printf '%s%s%s\n' "$B" "$1" "$R"
  printf '%s' "$C"
  printf '═%.0s' {1..60}; printf '%s\n\n' "$R"
}

banner " IVA 360 · push "

printf '%sВетка:%s %s\n' "$DIM" "$R" "$BRANCH"
printf '%sRemote:%s %s\n\n' "$DIM" "$R" "$REMOTE"

if ! bash "$ROOT/scripts/verify.sh"; then
  printf '\n%sПуш отменён: проверки не прошли.%s\n' "$RED" "$R"
  exit 1
fi

printf '\n%s%sВсе проверки зелёные.%s\n' "$G" "$B" "$R"

countdown() {
  local sec="${1:-5}"
  local i
  printf '\n%s%s⏱  До вопроса о пуше — обратный отсчёт (Ctrl+C — отмена)%s\n\n' "$M" "$B" "$R"
  for ((i = sec; i >= 1; i--)); do
    local filled=$((sec - i + 1))
    local bar="" j
    for ((j = 1; j <= sec; j++)); do
      if [[ $j -le $filled ]]; then
        bar+="█"
      else
        bar+="░"
      fi
    done
    printf '\r  %s%s%s  %2d  %s' "$C" "$bar" "$R" "$i" " "
    sleep 1
  done
  printf '\r  %s%s%s  готово.     \n\n' "$G" "$(printf '█%.0s' $(seq 1 "$sec"))" "$R"
}

if [[ "${PUSH_SKIP_COUNTDOWN:-}" != "1" ]]; then
  countdown "${PUSH_COUNTDOWN_SECONDS:-5}"
else
  printf '\n%s(отсчёт отключён: PUSH_SKIP_COUNTDOWN=1)%s\n\n' "$DIM" "$R"
fi

printf '%sЗапушить %s%s%s → %s%s%s ? [y/N] %s' "$B" "$C" "$BRANCH" "$R" "$C" "$REMOTE" "$R" "$R"
read -r reply
if [[ "${reply:-}" != "y" && "${reply:-}" != "Y" ]]; then
  printf '\n%sПуш отменён (ответ: «%s»).%s\n' "$Y" "${reply:-пусто}" "$R"
  exit 0
fi

printf '\n%sВыполняю: git push %s %s%s\n\n' "$G" "$REMOTE" "$BRANCH" "$R"
git push -u "$REMOTE" "$BRANCH"
printf '\n%sГотово.%s\n' "$G" "$R"
