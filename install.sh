#!/usr/bin/env bash
set -euo pipefail

DEST="$HOME/.config/opencode"

echo "Installing opencode-webdev to $DEST ..."

mkdir -p "$DEST/rules" "$DEST/skills" "$DEST/hooks" "$DEST/plugins"

cp AGENTS.md     "$DEST/AGENTS.md"
cp opencode.json "$DEST/opencode.json"
cp rules/*.md    "$DEST/rules/"
cp -r skills/.   "$DEST/skills/"
cp -r plugins/.  "$DEST/plugins/"

CLAUDE_HOOKS="$HOME/.claude/hooks"
if [ -d "$CLAUDE_HOOKS" ]; then
    echo "Copying hooks from $CLAUDE_HOOKS ..."
    cp "$CLAUDE_HOOKS/format-on-save.sh" "$DEST/hooks/"
    cp "$CLAUDE_HOOKS/guard-bash.sh"     "$DEST/hooks/"
    cp "$CLAUDE_HOOKS/phpstan-check.sh"  "$DEST/hooks/"
    cp "$CLAUDE_HOOKS/tsc-check.sh"      "$DEST/hooks/"
    chmod +x "$DEST/hooks/"*.sh
else
    echo "WARN: $CLAUDE_HOOKS nicht gefunden."
    echo "      Bitte format-on-save.sh, guard-bash.sh, phpstan-check.sh,"
    echo "      tsc-check.sh manuell nach $DEST/hooks/ kopieren."
fi

echo ""
echo "Fertig. Nächste Schritte:"
echo "  1. LITELLM_BASE_URL und LITELLM_API_KEY in ~/.zshrc oder ~/.bashrc setzen"
echo "  2. Shell neu laden: source ~/.zshrc"
echo "  3. opencode starten: opencode"