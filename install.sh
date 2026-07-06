#!/usr/bin/env bash
set -euo pipefail

DEST="$HOME/.config/opencode"

echo "Installing opencode-webdev to $DEST ..."

mkdir -p "$DEST/rules" "$DEST/skills" "$DEST/plugins" "$DEST/hooks"

cp AGENTS.md     "$DEST/AGENTS.md"
cp opencode.json "$DEST/opencode.json"
cp rules/*.md    "$DEST/rules/"
cp -r skills/.   "$DEST/skills/"
cp -r plugins/.  "$DEST/plugins/"

# Optional: vendored security-guidance pattern-warning hooks (used by the
# plugin only when python3 is available; the core hooks work without them).
if [ -d hooks/security-guidance ]; then
    cp -r hooks/security-guidance "$DEST/hooks/"
fi

echo ""
echo "Fertig. Nächste Schritte:"
echo "  1. LITELLM_BASE_URL und LITELLM_API_KEY in ~/.zshrc oder ~/.bashrc setzen"
echo "  2. Shell neu laden: source ~/.zshrc"
echo "  3. opencode starten: opencode"
echo ""
echo "Optionale Hooks (der self-contained Kern läuft auch ohne sie):"
echo "  - claudekit  → file-guard, check-any-changed, check-comment-replacement"
echo "                 Installation: npm install -g claudekit"
echo "  - python3    → security-guidance-Pattern-Warnungen"
echo "  - GITHUB_TOKEN → nur für den github-MCP-Server"