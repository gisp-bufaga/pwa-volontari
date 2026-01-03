module.exports = {
  root: true,
  env: { browser: true, es2020: true },
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:react/jsx-runtime',
    'plugin:react-hooks/recommended',
  ],
  ignorePatterns: ['dist', '.eslintrc.cjs'],
  parserOptions: { ecmaVersion: 'latest', sourceType: 'module' },
  settings: { react: { version: '18.2' } },
  plugins: ['react-refresh'],
  rules: {
    'react-refresh/only-export-components': [
      'warn',
      { allowConstantExport: true },
    ],
    // Prevent console statements in production
    'no-console': ['warn', {
      allow: ['error', 'warn']
    }],
    // Warn about unused variables
    'no-unused-vars': ['warn', {
      argsIgnorePattern: '^_',
      varsIgnorePattern: '^_'
    }],
    // Prefer const over let when possible
    'prefer-const': 'warn',
    // Disallow var
    'no-var': 'error',
    // Require === instead of ==
    'eqeqeq': ['warn', 'always'],
    // Disallow multiple empty lines
    'no-multiple-empty-lines': ['warn', { max: 1, maxEOF: 0 }],
    // Require semicolons
    'semi': ['warn', 'always'],
    // Enforce consistent quotes
    'quotes': ['warn', 'single', { avoidEscape: true }],
    // React specific
    'react/prop-types': 'off', // Using TypeScript would be better
    'react/react-in-jsx-scope': 'off', // Not needed in React 18+
  },
};
