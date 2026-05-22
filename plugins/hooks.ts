import { execFile } from 'child_process'
import { promisify } from 'util'

const execFileAsync = promisify(execFile)

const HOOKS_DIR = `${process.env['HOME']}/.config/opencode/hooks`

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

            try {
                await execFileAsync(`${HOOKS_DIR}/guard-bash.sh`, [command])
            } catch {
                // guard-bash.sh exits non-zero to signal a blocked command —
                // opencode's permission system handles the actual blocking
            }
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

            await Promise.allSettled([
                execFileAsync(`${HOOKS_DIR}/format-on-save.sh`, [file]),
                execFileAsync(`${HOOKS_DIR}/phpstan-check.sh`, [file]),
                execFileAsync(`${HOOKS_DIR}/tsc-check.sh`, [file]),
            ])
        },
    }
}

export default hooks