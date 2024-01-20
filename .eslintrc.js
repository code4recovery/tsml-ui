module.exports = {
  'env': {
    'browser': true,
    'es2021': true,
    jest: true,
  },
  'extends': [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:import/errors',
    'plugin:import/typescript',
  ],
  globals: {
    Lang: 'readonly',
    TSMLReactConfig: 'readonly',
    Translation: 'readonly',
  },
  'overrides': [
    {
      'env': {
        'node': true,
      },
      'files': ['.eslintrc.{js,cjs}'],
      'parserOptions': {
        'sourceType': 'script',
      },
    },
  ],
  parser: '@typescript-eslint/parser',
  'parserOptions': {
    'ecmaVersion': 'latest',
    'sourceType': 'module',
  },
  'plugins': ['react', 'import'],
  'rules': {
    'react/jsx-uses-react': 'off',
    'react/no-unknown-property': ['error', { ignore: ['css'] }],

    'no-unused-vars': [
      'error',
      {
        'argsIgnorePattern': '^_',
        'varsIgnorePattern': '^_',
        'caughtErrorsIgnorePattern': '^_',
      },
    ],

    'react/react-in-jsx-scope': 'off',
    'import/order': [
      'error',
      {
        'groups': [
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
        'pathGroups': [
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
        'pathGroupsExcludedImportTypes': ['builtin'],
        'newlines-between': 'always',
        'alphabetize': {
          order: 'asc',
          caseInsensitive: true,
        },
      },
    ],
  },
  settings: {
    'import/resolver': {
      typescript: {
        project: './tsconfig.json',
      },
    },
  },
};
