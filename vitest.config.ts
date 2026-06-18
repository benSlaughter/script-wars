import { defineConfig } from 'vitest/config';
import { sveltekit } from '@sveltejs/kit/vite';

export default defineConfig({
	plugins: [sveltekit()],
	test: {
		include: ['tests/**/*.test.ts'],
		environmentMatchGlobs: [
			['tests/sandbox.test.ts', 'node'],
			['tests/match-runner.test.ts', 'node'],
			['tests/rps.test.ts', 'node'],
			['tests/**/*.test.ts', 'jsdom']
		]
	}
});
