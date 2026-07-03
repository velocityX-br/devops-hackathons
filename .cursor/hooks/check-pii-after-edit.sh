#!/bin/bash
# 在编辑 docs/blog 等公开内容后自动运行 PII 检查，向 Agent 注入告警上下文。
set -euo pipefail

input=$(cat)
file_path=$(echo "$input" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('file_path',''))" 2>/dev/null || echo "")

# 仅检查会公开发布的路径
if [[ -z "$file_path" ]]; then
  echo '{}'
  exit 0
fi

case "$file_path" in
  blog/*|docs/*|src/*|static/*|i18n/*) ;;
  *) echo '{}'; exit 0 ;;
esac

case "$file_path" in
  *.md|*.mdx|*.json|*.yml|*.yaml) ;;
  *) echo '{}'; exit 0 ;;
esac

cd "$(git rev-parse --show-toplevel 2>/dev/null || pwd)" || exit 0

if ! command -v node >/dev/null 2>&1; then
  echo '{}'
  exit 0
fi

result=$(node scripts/check-pii.cjs --json 2>/dev/null || true)
violations=$(echo "$result" | python3 -c "
import sys, json
try:
    d = json.load(sys.stdin)
    hits = [f for f in d.get('findings', []) if f.get('file') == sys.argv[1]]
    print(len(hits))
except Exception:
    print(0)
" "$file_path" 2>/dev/null || echo "0")

if [[ "$violations" != "0" ]]; then
  python3 -c "
import json
print(json.dumps({
    'additional_context': (
        '⚠️ PII 检查：刚编辑的文件 \"' + '$file_path' + '\" 可能包含企业敏感信息。'
        ' 请运行 yarn check:pii 查看详情并脱敏后再提交。'
        ' 规则见 .cursor/rules/pii-protection.mdc 与 scripts/pii-rules.json。'
    )
}))
"
else
  echo '{}'
fi
