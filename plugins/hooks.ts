import { execFile, spawn } from 'child_process'
import { access, constants } from 'fs/promises'
import { promisify } from 'util'

const execFileAsync = promisify(execFile)

// ---------------------------------------------------------------------------
// Self-contained core — no external dependencies, works standalone.
// ---------------------------------------------------------------------------

const DANGEROUS_PATTERNS: readonly RegExp[] = [
    /rm -rf \//,
    /rm -rf ~/,
    /rm -rf \$HOME/,
    />\s*\/dev\/sda/,
    /dd if=.* of=\/dev\//,
    /mkfs\./,
    /DROP DATABASE/,
    /DROP TABLE.*CASCADE/,
    /git push --force.*(main|master)/,
    /git push -f.*(main|master)/,
    /: \$\{VAR:=\}; rm/,
]

const PRETTIER_EXTENSIONS = new Set(['ts', 'tsx', 'js', 'jsx', 'vue', 'json', 'css', 'scss'])

// ---------------------------------------------------------------------------
// Optional layer — activates only when claudekit / python + security-guidance
// are present. Every call fails open, so the core keeps working without them.
// ---------------------------------------------------------------------------

const CLAUDEKIT = 'claudekit-hooks'
const SECURITY_DIR = `${process.env['HOME']}/.config/opencode/hooks/security-guidance`

// Only the regex pattern-warning layer of security-guidance is wanted; its
// LLM diff-review layers need an Anthropic API key and stay switched off.
const SECURITY_ENV: Record<string, string> = {
    ENABLE_CODE_SECURITY_REVIEW: '0',
    ENABLE_COMMIT_REVIEW: '0',
}

const CLAUDE_TOOL_NAMES: Record<string, string> = {
    read: 'Read',
    edit: 'Edit',
    write: 'Write',
}

const SELF_REVIEW_PROMPT = [
    'Bevor du abschließt — kritisches Self-Review deiner Änderungen:',
    '- Vollständigkeit: Funktionalität mit Platzhaltern/Stubs statt echter Logik versehen?',
    '- Code-Qualität: Duplizierte Logik, die extrahiert gehört?',
    '- Integration: Sollten neue Teile in sauberere Abstraktionen ausgelagert werden?',
    '- Konsistenz: Folgst du den bestehenden Mustern im Codebase?',
    'Behebe gefundene Probleme, bevor du fortfährst.',
].join('\n')

interface ToolBeforeInput
{
    tool: string
    sessionID: string
    callID: string
}

interface ToolBeforeOutput
{
    args: Record<string, unknown>
}

interface ToolAfterInput
{
    tool: string
    sessionID: string
    callID: string
    args: Record<string, unknown>
}

interface ToolAfterOutput
{
    title: string
    output: string
    metadata: Record<string, unknown>
}

interface OpencodeEvent
{
    type: string
    properties?: { sessionID?: string }
}

interface OpencodeClient
{
    session: {
        prompt: (params: {
            path: { id: string }
            body: { parts: Array<{ type: string; text: string }> }
        }) => Promise<unknown>
    }
}

interface PluginContext
{
    directory?: string
    worktree?: string
    client?: OpencodeClient
}

interface HookResult
{
    code: number
    stdout: string
    stderr: string
}

async function fileExists(path: string): Promise<boolean>
{
    try {
        await access(path, constants.F_OK)
        return true
    } catch {
        return false
    }
}

function getExtension(filePath: string): string
{
    const dot = filePath.lastIndexOf('.')
    if (dot === -1) {
        return ''
    }

    return filePath.slice(dot + 1).toLowerCase()
}

function extractOutput(error: unknown, maxLines: number): string
{
    if (!(error instanceof Error)) {
        return ''
    }

    const execError = error as { stdout?: string; stderr?: string }
    const combined = ((execError.stdout ?? '') + (execError.stderr ?? '')).trim()

    if (combined === '') {
        return ''
    }

    return combined.split('\n').slice(0, maxLines).join('\n')
}

function claudeToolName(tool: string): string
{
    return CLAUDE_TOOL_NAMES[tool] ?? tool
}

function guardBash(command: string): void
{
    for (const pattern of DANGEROUS_PATTERNS) {
        if (pattern.test(command)) {
            throw new Error(
                `Gefährliches Kommando blockiert: Pattern '${pattern.source}' erkannt. `
                + 'Bitte den Befehl manuell ausführen falls beabsichtigt.',
            )
        }
    }
}

async function formatOnSave(file: string): Promise<void>
{
    if (!await fileExists(file)) {
        return
    }

    const ext = getExtension(file)

    if (ext === 'php') {
        if (await fileExists('vendor/bin/php-cs-fixer')) {
            await execFileAsync('vendor/bin/php-cs-fixer', ['fix', file, '--quiet'])
        }
        return
    }

    if (PRETTIER_EXTENSIONS.has(ext)) {
        if (await fileExists('node_modules/.bin/prettier')) {
            await execFileAsync('node_modules/.bin/prettier', ['--write', file, '--log-level', 'silent'])
        }
    }
}

/** Runs PHPStan on a PHP file and returns its findings (empty when clean). */
async function phpstanCheck(file: string): Promise<string>
{
    if (getExtension(file) !== 'php') {
        return ''
    }

    if (!await fileExists(file) || !await fileExists('vendor/bin/phpstan')) {
        return ''
    }

    try {
        await execFileAsync('vendor/bin/phpstan', ['analyse', file, '--no-progress', '--error-format=raw'])
        return ''
    } catch (error: unknown) {
        return extractOutput(error, 20)
    }
}

/** Type-checks the project on .ts/.tsx changes and returns errors (empty when clean). */
async function tscCheck(file: string): Promise<string>
{
    const ext = getExtension(file)
    if (ext !== 'ts' && ext !== 'tsx') {
        return ''
    }

    if (!await fileExists('node_modules/.bin/tsc') || !await fileExists('tsconfig.json')) {
        return ''
    }

    try {
        await execFileAsync('node_modules/.bin/tsc', ['--noEmit', '--pretty', 'false'])
        return ''
    } catch (error: unknown) {
        return extractOutput(error, 30)
    }
}

/**
 * Runs an optional external hook (`claudekit-hooks run <hook>` or the vendored
 * security-guidance python hook), feeding it the Claude-Code event payload on
 * stdin. Never rejects: a missing binary resolves to a no-op so the core keeps
 * working when the optional tooling is absent.
 */
function runExternalHook(command: string, args: string[], payload: unknown, env?: Record<string, string>): Promise<HookResult>
{
    return new Promise((resolve) => {
        const child = spawn(command, args, {
            stdio: ['pipe', 'pipe', 'pipe'],
            env: env !== undefined ? { ...process.env, ...env } : process.env,
        })

        let stdout = ''
        let stderr = ''
        let settled = false

        const finish = (result: HookResult): void => {
            if (settled) {
                return
            }

            settled = true
            resolve(result)
        }

        child.stdout.on('data', (chunk: Buffer) => {
            stdout += chunk.toString()
        })
        child.stderr.on('data', (chunk: Buffer) => {
            stderr += chunk.toString()
        })
        child.stdin.on('error', () => {})
        child.on('error', () => finish({ code: 0, stdout: '', stderr: '' }))
        child.on('close', (code: number | null) => finish({ code: code ?? 0, stdout, stderr }))

        child.stdin.end(JSON.stringify(payload))
    })
}

/**
 * Blocks access to sensitive files via claudekit's file-guard. That hook always
 * exits 0 and reports its verdict as JSON on stdout. Fails open on unparseable
 * output (claudekit not installed), so the core never blocks work without it.
 */
async function guardFileAccess(tool: string, filePath: string, cwd: string): Promise<void>
{
    const result = await runExternalHook(CLAUDEKIT, ['run', 'file-guard'], {
        hook_event_name: 'PreToolUse',
        tool_name: claudeToolName(tool),
        cwd,
        tool_input: { file_path: filePath },
    })

    let decision = ''
    let reason = ''

    try {
        const parsed = JSON.parse(result.stdout) as {
            hookSpecificOutput?: { permissionDecision?: string; permissionDecisionReason?: string }
        }
        decision = parsed.hookSpecificOutput?.permissionDecision ?? ''
        reason = parsed.hookSpecificOutput?.permissionDecisionReason ?? ''
    } catch {
        return
    }

    if (decision === 'deny') {
        throw new Error(reason !== '' ? reason : 'Zugriff durch file-guard blockiert.')
    }
}

/** Runs a claudekit PostToolUse check; returns its stderr message on exit != 0. */
async function claudekitCheck(hook: string, payload: unknown): Promise<string>
{
    const result = await runExternalHook(CLAUDEKIT, ['run', hook], payload)

    if (result.code !== 0) {
        return result.stderr.trim() !== '' ? result.stderr.trim() : result.stdout.trim()
    }

    return ''
}

/**
 * Runs the security-guidance regex pattern layer and returns its advisory text
 * when a dangerous pattern is detected. It reads `content` for write but
 * `new_string` for edit, so the payload field is chosen per tool.
 */
async function securityCheck(tool: string, filePath: string, changed: string, cwd: string): Promise<string>
{
    const toolInput = tool === 'edit'
        ? { file_path: filePath, new_string: changed }
        : { file_path: filePath, content: changed }

    const result = await runExternalHook(
        'bash',
        [`${SECURITY_DIR}/sg-python.sh`, `${SECURITY_DIR}/security_reminder_hook.py`],
        {
            hook_event_name: 'PostToolUse',
            tool_name: claudeToolName(tool),
            cwd,
            tool_input: toolInput,
        },
        SECURITY_ENV,
    )

    try {
        const parsed = JSON.parse(result.stdout) as {
            metrics?: { pattern_hits?: number }
            hookSpecificOutput?: { additionalContext?: string }
        }

        if ((parsed.metrics?.pattern_hits ?? 0) > 0) {
            return parsed.hookSpecificOutput?.additionalContext ?? ''
        }
    } catch {
        // not installed / no python / no findings — nothing to surface
    }

    return ''
}

const hooks = async (ctx: PluginContext) =>
{
    const projectRoot = ctx.worktree ?? ctx.directory ?? process.cwd()

    // self-review state, scoped per session: review once per edit-burst and
    // never let the injected review turn trigger another review.
    const reviewState = new Map<string, { edited: boolean; inFlight: boolean }>()

    const stateFor = (sessionID: string): { edited: boolean; inFlight: boolean } => {
        let state = reviewState.get(sessionID)

        if (state === undefined) {
            state = { edited: false, inFlight: false }
            reviewState.set(sessionID, state)
        }

        return state
    }

    return {
        'tool.execute.before': async (input: ToolBeforeInput, output: ToolBeforeOutput) => {
            const args = output.args

            if (input.tool === 'bash') {
                const command = typeof args['command'] === 'string' ? args['command'] : ''
                guardBash(command)
                return
            }

            if (input.tool === 'read' || input.tool === 'edit' || input.tool === 'write') {
                const filePath = typeof args['filePath'] === 'string' ? args['filePath'] : ''

                if (filePath !== '') {
                    await guardFileAccess(input.tool, filePath, projectRoot)
                }
            }
        },

        'tool.execute.after': async (input: ToolAfterInput, output: ToolAfterOutput) => {
            if (input.tool !== 'edit' && input.tool !== 'write') {
                return
            }

            const filePath = typeof input.args['filePath'] === 'string' ? input.args['filePath'] : ''

            if (filePath === '') {
                return
            }

            stateFor(input.sessionID).edited = true

            // Format on disk first so the static checks see the formatted result.
            await formatOnSave(filePath)

            const changed = typeof input.args['content'] === 'string'
                ? input.args['content']
                : (typeof input.args['newString'] === 'string' ? input.args['newString'] : '')

            const postPayload = {
                hook_event_name: 'PostToolUse',
                tool_name: claudeToolName(input.tool),
                cwd: projectRoot,
                tool_input: { file_path: filePath },
            }

            const commentPayload = {
                ...postPayload,
                tool_input: {
                    file_path: filePath,
                    old_string: typeof input.args['oldString'] === 'string' ? input.args['oldString'] : '',
                    new_string: typeof input.args['newString'] === 'string' ? input.args['newString'] : '',
                },
            }

            const results = await Promise.all([
                phpstanCheck(filePath),
                tscCheck(filePath),
                claudekitCheck('check-any-changed', postPayload),
                input.tool === 'edit' ? claudekitCheck('check-comment-replacement', commentPayload) : Promise.resolve(''),
                securityCheck(input.tool, filePath, changed, projectRoot),
            ])

            const warnings = results.filter((message) => message.trim() !== '')

            // Surface formatter/static-analysis/security warnings back to the model.
            if (warnings.length > 0 && typeof output.output === 'string') {
                output.output += `\n\n--- Statische Analyse (Hook-Warnungen) ---\n${warnings.join('\n\n')}`
            }
        },

        event: async ({ event }: { event: OpencodeEvent }) => {
            if (event.type !== 'session.idle') {
                return
            }

            const sessionID = event.properties?.sessionID ?? ''

            if (sessionID === '') {
                return
            }

            const state = stateFor(sessionID)

            // The self-review turn itself just went idle — clear state, never loop.
            if (state.inFlight) {
                state.inFlight = false
                state.edited = false
                return
            }

            if (!state.edited || ctx.client === undefined) {
                return
            }

            state.edited = false
            state.inFlight = true

            try {
                await ctx.client.session.prompt({
                    path: { id: sessionID },
                    body: { parts: [{ type: 'text', text: SELF_REVIEW_PROMPT }] },
                })
            } catch {
                // Injection failed (e.g. SDK shape mismatch) — never break the session.
                state.inFlight = false
            }
        },
    }
}

export default hooks
