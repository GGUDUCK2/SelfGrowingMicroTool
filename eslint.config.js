import js from '@eslint/js';
import ts from 'typescript-eslint';
import svelte from 'eslint-plugin-svelte';
import globals from 'globals';

/** @type {import('eslint').Linter.Config[]} */
export default [
	js.configs.recommended,
	...ts.configs.recommended,
	...svelte.configs['flat/recommended'],
	{
		languageOptions: {
			globals: {
				...globals.browser,
				...globals.node
			}
		}
	},
	{
		files: ['**/*.svelte'],
		languageOptions: {
			parserOptions: {
				parser: ts.parser
			}
		}
	},
	{
		ignores: ['build/', '.svelte-kit/', 'dist/']
	},
	{
		files: ['src/lib/components/color-master/UIPreview.svelte', 'src/lib/components/seo-forge/AuditPanel.svelte', 'src/lib/components/seo-forge/PreviewCard.svelte', 'src/lib/components/clamp-forge/ClampBuilder.svelte'],
		rules: {
			'@typescript-eslint/no-unused-vars': 'off'
		}
	}
];
