import js from '@eslint/js';
import globals from 'globals'
import ts from 'typescript-eslint';
import reactPlugin from 'eslint-plugin-react';
import reactHooksPlugin from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config';

export default defineConfig([
    globalIgnores(['public']),
    {
        files: ['**/*.{ts,tsx}'],
        extends: [
            js.configs.recommended,
            ...ts.configs.recommended,
            reactPlugin.configs.flat.recommended,
            reactHooksPlugin.configs.flat.recommended,
            reactRefresh.configs.vite,
            reactPlugin.configs.flat['jsx-runtime'],
        ],
        languageOptions: {
            parserOptions: {
                ecmaFeatures: {
                    jsx: true,
                },
                ecmaVersion: 2020,
                sourceType: 'module',
            },
            globals: {
                ...globals.browser,
                // Custom globals
                Lang: 'readonly',
                TSMLReactConfig: 'readonly',
                Translation: 'readonly',
            },
        },
        settings: {
            react: {
                version: 'detect',
            },
        },
        rules: {
            'react/jsx-uses-react': 'off',
            'react/react-in-jsx-scope': 'off',
            'react/no-unknown-property': ['error', { ignore: ['css'] }],
            '@typescript-eslint/no-unused-vars': [
                'error',
                {
                    argsIgnorePattern: '^_|^e$',
                    varsIgnorePattern: '^_|^e$',
                    caughtErrorsIgnorePattern: '^_|^e$',
                },
            ],
            // Turning these off for now to clean up warnings
            'react-refresh/only-export-components': 'off',
            'react-hooks/exhaustive-deps': 'off',
            'react-hooks/set-state-in-effect': 'off',
            'react-hooks/immutability': 'off',
            'react-hooks/preserve-manual-memoization': 'off'
        },
    },
]);
