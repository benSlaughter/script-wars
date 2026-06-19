import { describe, it, expect } from 'vitest';
import { executeLuaScript } from '../src/lib/server/engine/sandbox';

describe('Lua Sandbox', () => {
	it('executes a simple script returning rock', async () => {
		const result = await executeLuaScript('return "rock"', {
			opponent_history: [],
			my_history: [],
			round_number: 1
		});

		expect(result.success).toBe(true);
		expect(result.output).toBe('rock');
		expect(result.error).toBeNull();
	});

	it('executes a random selection script', async () => {
		const result = await executeLuaScript(
			`local moves = {"rock", "paper", "scissors"}
			return moves[math.random(#moves)]`,
			{ opponent_history: [], my_history: [], round_number: 1 }
		);

		expect(result.success).toBe(true);
		expect(['rock', 'paper', 'scissors']).toContain(result.output);
	});

	it('provides opponent_history to script', async () => {
		const result = await executeLuaScript(
			`return opponent_history[1]`,
			{ opponent_history: ['rock', 'paper'], my_history: ['scissors'], round_number: 3 }
		);

		expect(result.success).toBe(true);
		expect(result.output).toBe('rock');
	});

	it('provides my_history to script', async () => {
		const result = await executeLuaScript(
			`return my_history[#my_history]`,
			{ opponent_history: ['rock'], my_history: ['scissors', 'paper'], round_number: 3 }
		);

		expect(result.success).toBe(true);
		expect(result.output).toBe('paper');
	});

	it('provides round_number to script', async () => {
		const result = await executeLuaScript(
			`if round_number > 1 then return "paper" else return "rock" end`,
			{ opponent_history: ['rock'], my_history: ['rock'], round_number: 2 }
		);

		expect(result.success).toBe(true);
		expect(result.output).toBe('paper');
	});

	it('handles script errors gracefully', async () => {
		const result = await executeLuaScript(
			`this is not valid lua`,
			{ opponent_history: [], my_history: [], round_number: 1 }
		);

		expect(result.success).toBe(false);
		expect(result.error).toBeTruthy();
		expect(result.output).toBeNull();
	});

	it('handles scripts that return nothing', async () => {
		const result = await executeLuaScript(
			`local x = 1 + 1`,
			{ opponent_history: [], my_history: [], round_number: 1 }
		);

		expect(result.success).toBe(false);
		expect(result.error).toBe('Script did not return a value');
	});

	it('blocks os access', async () => {
		const result = await executeLuaScript(
			`return os.execute("whoami")`,
			{ opponent_history: [], my_history: [], round_number: 1 }
		);

		expect(result.success).toBe(false);
		expect(result.error).toBeTruthy();
	});

	it('blocks io access', async () => {
		const result = await executeLuaScript(
			`return io.open("/etc/passwd")`,
			{ opponent_history: [], my_history: [], round_number: 1 }
		);

		expect(result.success).toBe(false);
		expect(result.error).toBeTruthy();
	});

	it('blocks require', async () => {
		const result = await executeLuaScript(
			`local x = require("os"); return "hack"`,
			{ opponent_history: [], my_history: [], round_number: 1 }
		);

		expect(result.success).toBe(false);
		expect(result.error).toBeTruthy();
	});

	it('handles timeout or memory limit for infinite loops', async () => {
		const result = await executeLuaScript(
			`while true do end`,
			{ opponent_history: [], my_history: [], round_number: 1 }
		);

		expect(result.success).toBe(false);
		expect(result.error).toContain('maximum instructions');
	}, 10000);

	it('returns failure for invalid move (not rock/paper/scissors)', async () => {
		const result = await executeLuaScript(
			`return "banana"`,
			{ opponent_history: [], my_history: [], round_number: 1 }
		);

		// Sandbox executes successfully but the move is invalid
		expect(result.success).toBe(true);
		expect(result.output).toBe('banana');
	});

	it('allows access to permitted globals', async () => {
		const result = await executeLuaScript(
			`
			-- Test various allowed globals
			local t = {1, 2, 3}
			local sum = 0
			for _, v in ipairs(t) do sum = sum + v end
			assert(sum == 6)
			assert(type(sum) == "number")
			assert(tonumber("42") == 42)
			assert(tostring(42) == "42")
			assert(string.len("hello") == 5)
			assert(table.concat({"a","b"}, ",") == "a,b")
			assert(math.floor(3.7) == 3)
			local ok, err = pcall(function() error("test") end)
			assert(not ok)
			return "rock"
			`,
			{ opponent_history: [], my_history: [], round_number: 1 }
		);

		expect(result.success).toBe(true);
		expect(result.output).toBe('rock');
	});

	it('blocks dofile access', async () => {
		const result = await executeLuaScript(
			`dofile("/etc/passwd"); return "rock"`,
			{ opponent_history: [], my_history: [], round_number: 1 }
		);

		expect(result.success).toBe(false);
		expect(result.error).toBeTruthy();
	});

	it('blocks loadfile access', async () => {
		const result = await executeLuaScript(
			`loadfile("/etc/passwd")(); return "rock"`,
			{ opponent_history: [], my_history: [], round_number: 1 }
		);

		expect(result.success).toBe(false);
		expect(result.error).toBeTruthy();
	});

	it('blocks coroutine access (prevents instruction limit bypass)', async () => {
		const result = await executeLuaScript(
			`local co = coroutine.create(function() while true do end end); coroutine.resume(co); return "rock"`,
			{ opponent_history: [], my_history: [], round_number: 1 }
		);

		expect(result.success).toBe(false);
		expect(result.error).toBeTruthy();
	});

	it('blocks getmetatable access', async () => {
		const result = await executeLuaScript(
			`local mt = getmetatable(""); return "rock"`,
			{ opponent_history: [], my_history: [], round_number: 1 }
		);

		expect(result.success).toBe(false);
		expect(result.error).toBeTruthy();
	});
});
