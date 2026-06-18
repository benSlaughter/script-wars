import globals from 'globals';
import tseslint from 'typescript-eslint';
import sveltePlugin from 'eslint-plugin-svelte';
import prettier from 'eslint-config-prettier';

export default tseslint.config(
	{
		ignores: ['build/', '.svelte-kit/', 'node_modules/', 'drizzle/']
	},
	{
		languageOptions: {
			globals: { ...globals.browser, ...globals.node }
		}
	},
	...tseslint.configs.recommended,
	...sveltePlugin.configs.recommended,
	prettier,
	{
		files: ['**/*.svelte', '**/*.svelte.ts'],
		languageOptions: {
			parserOptions: {
				parser: tseslint.parser
			}
		}
	},
	{
		rules: {
			'@typescript-eslint/no-unused-vars': [
				'warn',
				{ argsIgnorePattern: '^_', varsIgnorePattern: '^_' }
			]
		}
	}
);
