#!/usr/bin/env bash
# تشغيل المشروع: بناء الملف ثم فتحه في المتصفح على خادم محلي.
#   ./run.sh                 → منفذ 8080 ويفتح المتصفح
#   ./run.sh --port=3000     → منفذ مخصص
#   ./run.sh --no-open       → بلا فتح المتصفح
set -euo pipefail
cd "$(dirname "$0")"

# البحث عن Node.js (يشمل التثبيت المحلي في ~/.local/node و nvm)
NODE=""
if command -v node >/dev/null 2>&1; then
  NODE="$(command -v node)"
else
  for c in "$HOME/.local/node/bin/node" "$HOME/.nvm/versions/node"/*/bin/node /usr/local/bin/node; do
    [ -x "$c" ] && NODE="$c" && break
  done
fi
if [ -z "$NODE" ]; then
  echo "✘ Node.js غير مثبَّت — ثبّته من https://nodejs.org ثم أعد المحاولة" >&2
  exit 1
fi
export PATH="$(dirname "$NODE"):$PATH"

# تثبيت تبعيات التطوير عند أول تشغيل (jsdom للاختبار فقط)
if [ ! -d node_modules ] && command -v npm >/dev/null 2>&1; then
  echo "→ تثبيت التبعيات (مرة واحدة) ..."
  npm install --no-audit --no-fund >/dev/null 2>&1 || echo "  (تعذّر التثبيت — البناء والتشغيل يعملان بدونه)"
fi

OPEN="--open"
ARGS=()
for a in "$@"; do
  if [ "$a" = "--no-open" ]; then OPEN=""; else ARGS+=("$a"); fi
done

echo "→ بناء dist/index.html ..."
"$NODE" build.js

exec "$NODE" tools/serve.js ${OPEN} "${ARGS[@]+"${ARGS[@]}"}"
