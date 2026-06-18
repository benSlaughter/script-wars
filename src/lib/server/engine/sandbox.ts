import { LuaFactory } from 'wasmoon';

const MAX_INSTRUCTIONS = 100000; // Max Lua VM instructions per execution
const MEMORY_LIMIT = 1024 * 1024; // 1MB

export interface SandboxResult {
	success: boolean;
	output: string | null;
	error: string | null;
	executionTimeMs: number;
}

export interface ScriptContext {
	opponent_history: string[];
	my_history: string[];
	round_number: number;
}

const factory = new LuaFactory();

/**
 * Build the sandboxed Lua wrapper that:
 * 1. Sets an instruction count hook to prevent infinite loops
 * 2. Removes dangerous globals
 * 3. Executes user code in a controlled function
 */
function buildSandboxedCode(userCode: string): string {
	return `
-- Instruction limiter
local __count = 0
debug.sethook(function()
	__count = __count + 1
	if __count > ${MAX_INSTRUCTIONS} then
		error("Script timeout: exceeded maximum instructions")
	end
end, "", 1000)

-- Remove dangerous globals
os = nil
io = nil
dofile = nil
loadfile = nil
require = nil
package = nil
collectgarbage = nil
rawget = nil
rawset = nil
rawequal = nil
rawlen = nil
load = nil
debug = nil

-- Execute user code
${userCode}
`;
}

/**
 * Execute a Lua script in a sandboxed environment.
 * The script must return a string value.
 */
export async function executeLuaScript(
	code: string,
	context: ScriptContext
): Promise<SandboxResult> {
	const startTime = performance.now();

	let lua;
	try {
		lua = await factory.createEngine({ traceAllocations: true });

		// Set memory limit
		lua.global.setMemoryMax(MEMORY_LIMIT);

		// Inject game context as global variables
		lua.global.set('opponent_history', context.opponent_history);
		lua.global.set('my_history', context.my_history);
		lua.global.set('round_number', context.round_number);

		// Execute sandboxed code (hook + cleanup + user code in one chunk)
		const sandboxedCode = buildSandboxedCode(code);
		const result = await lua.doString(sandboxedCode);

		const executionTimeMs = performance.now() - startTime;

		// Validate output is a string
		if (result === null || result === undefined) {
			return {
				success: false,
				output: null,
				error: 'Script did not return a value',
				executionTimeMs
			};
		}

		const output = String(result).toLowerCase().trim();

		return {
			success: true,
			output,
			error: null,
			executionTimeMs
		};
	} catch (err) {
		const executionTimeMs = performance.now() - startTime;
		const errorMsg = err instanceof Error ? err.message : 'Unknown error';

		return {
			success: false,
			output: null,
			error: errorMsg,
			executionTimeMs
		};
	} finally {
		if (lua) {
			lua.global.close();
		}
	}
}
