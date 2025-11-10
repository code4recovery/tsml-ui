import js from '@eslint/js';
import typescriptParser from '@typescript-eslint/parser';
import importPlugin from 'eslint-plugin-import';
import react from 'eslint-plugin-react';

export default [
    js.configs.recommended,
    {
        files: ['**/*.{js,jsx,ts,tsx}'],
        plugins: {
            react,
            import: importPlugin,
        },
        languageOptions: {
            parser: typescriptParser,
            ecmaVersion: 'latest',
            sourceType: 'module',
            globals: {
                // Browser globals
                window: 'readonly',
                document: 'readonly',
                navigator: 'readonly',
                console: 'readonly',
                // ES2021 globals are included by default

                // Jest globals
                describe: 'readonly',
                test: 'readonly',
                expect: 'readonly',
                it: 'readonly',
                beforeEach: 'readonly',
                afterEach: 'readonly',
                beforeAll: 'readonly',
                afterAll: 'readonly',
                jest: 'readonly',

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
            'import/resolver': {
                typescript: {
                    project: './tsconfig.json',
                },
            },
        },
        rules: {
            ...react.configs.recommended.rules,
            ...importPlugin.configs.errors.rules,
            ...importPlugin.configs.typescript.rules,

            'react/jsx-uses-react': 'off',
            'react/react-in-jsx-scope': 'off',
            'react/no-unknown-property': ['error', { ignore: ['css'] }],
            'no-unused-vars': [
                'error',
                {
                    argsIgnorePattern: '^_',
                    varsIgnorePattern: '^_',
                    caughtErrorsIgnorePattern: '^_',
                },
            ],
            'import/order': [
                'error',
                {
                    groups: [
                        'builtin',
                        'external',
                        'internal',
                        'unknown',
                        'parent',
                        'sibling',
                        'index',
                        'object',
                        'type',
                    ],
                    pathGroups: [
                        {
                            pattern: 'react',
                            group: 'builtin',
                            position: 'before',
                        },
                        {
                            pattern: '@/**',
                            group: 'external',
                            position: 'after',
                        },
                    ],
                    pathGroupsExcludedImportTypes: ['builtin'],
                    'newlines-between': 'always',
                    alphabetize: {
                        order: 'asc',
                        caseInsensitive: true,
                    },
                },
            ],
        },
    },
    {
        files: ['eslint.config.js'],
        languageOptions: {
            sourceType: 'module',
            globals: {
                process: 'readonly',
                __dirname: 'readonly',
                __filename: 'readonly',
                module: 'readonly',
                require: 'readonly',
            },
        },
    },
];
