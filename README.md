# opencode-webdev

opencode-Konfiguration für lokales LLM (Qwen3.6-35B via LiteLLM/vLLM).

## Voraussetzungen

- [opencode](https://opencode.ai) installiert (`brew install sst/tap/opencode`)
- `claude-webdev` installiert (für Shell-Hooks unter `~/.claude/hooks/`)
- LiteLLM-Zugang mit `LITELLM_BASE_URL` und `LITELLM_API_KEY`

## Setup

**1. Env-Variablen setzen** (in `~/.zshrc` oder `~/.bashrc`):

```bash
export LITELLM_BASE_URL="https://litellm.your-host.com/v1"
export LITELLM_API_KEY="sk-xxx"
```

**2. Installieren:**

```bash
cd ~/Projekte/opencode-webdev
./install.sh
source ~/.zshrc
```

**3. opencode starten:**

```bash
opencode
```

## Was installiert wird

| Ziel | Inhalt |
|---|---|
| `~/.config/opencode/opencode.json` | Provider-Config (LiteLLM), Permissions, MCP-Server, Skills |
| `~/.config/opencode/AGENTS.md` | Haupt-Kontext (Always Start Here) |
| `~/.config/opencode/rules/` | 19 Coding-Regeln |
| `~/.config/opencode/skills/` | 18 Domain-Skills + 24 wondelai-Knowledge-Skills |
| `~/.config/opencode/hooks/` | Shell-Hooks (von `~/.claude/hooks/` kopiert) |
| `~/.config/opencode/plugins/hooks.ts` | Hook-Plugin (format-on-save, guard-bash, phpstan, tsc) |

## Per-Projekt-Skills

Projekt-spezifische Skills in `.opencode/skills/<name>/SKILL.md` ablegen,
dann im Projekt-`opencode.json` ergänzen:

```json
{
  "skills": {
    "paths": [".opencode/skills"]
  }
}
```

## Troubleshooting

```bash
opencode debug config   # Config validieren
opencode debug skill    # Geladene Skills auflisten
opencode debug paths    # Installationspfade anzeigen
```