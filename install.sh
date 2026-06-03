#!/usr/bin/env bash
set -euo pipefail

DEST="$HOME/.config/opencode"

echo "Installing opencode-webdev to $DEST ..."

mkdir -p "$DEST/rules" "$DEST/skills" "$DEST/plugins"

cp AGENTS.md     "$DEST/AGENTS.md"
cp opencode.json "$DEST/opencode.json"
cp rules/*.md    "$DEST/rules/"
cp -r skills/.   "$DEST/skills/"
cp -r plugins/.  "$DEST/plugins/"

echo ""
echo "Fertig. Nächste Schritte:"
echo "  1. LITELLM_BASE_URL und LITELLM_API_KEY in ~/.zshrc oder ~/.bashrc setzen"
echo "  2. Shell neu laden: source ~/.zshrc"
echo "  3. opencode starten: opencode"