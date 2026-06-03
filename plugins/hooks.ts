import { execFile } from 'child_process'
import { access, constants } from 'fs/promises'
import { promisify } from 'util'

const execFileAsync = promisify(execFile)

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

async function phpstanCheck(file: string): Promise<void>
{
    if (getExtension(file) !== 'php') {
        return
    }

    if (!await fileExists(file)) {
        return
    }

    if (!await fileExists('vendor/bin/phpstan')) {
        return
    }

    try {
        await execFileAsync('vendor/bin/phpstan', ['analyse', file, '--no-progress', '--error-format=raw'])
    } catch (error: unknown) {
        const output = extractOutput(error, 20)
        if (output !== '') {
            console.error(output)
        }
    }
}

async function tscCheck(file: string): Promise<void>
{
    const ext = getExtension(file)
    if (ext !== 'ts' && ext !== 'tsx') {
        return
    }

    if (!await fileExists('node_modules/.bin/tsc')) {
        return
    }

    if (!await fileExists('tsconfig.json')) {
        return
    }

    try {
        await execFileAsync('node_modules/.bin/tsc', ['--noEmit', '--pretty', 'false'])
    } catch (error: unknown) {
        const output = extractOutput(error, 30)
        if (output !== '') {
            console.error(output)
        }
    }
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

const hooks = async () =>
{
    return {
        'tool.execute.before': async (input: { tool: string; args: Record<string, unknown> }) => {
            if (input.tool !== 'bash') {
                return
            }

            const command = typeof input.args['command'] === 'string'
                ? input.args['command']
                : ''

            guardBash(command)
        },

        'tool.execute.after': async (input: { tool: string; args: Record<string, unknown> }) => {
            if (input.tool !== 'edit' && input.tool !== 'write') {
                return
            }

            const file = typeof input.args['file_path'] === 'string'
                ? input.args['file_path']
                : ''

            if (file === '') {
                return
            }

            await formatOnSave(file)

            await Promise.allSettled([
                phpstanCheck(file),
                tscCheck(file),
            ])
        },
    }
}

export default hooks
