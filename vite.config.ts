import { defineConfig } from 'vite-plus'

// https://viteplus.dev/config/
export default defineConfig({
  staged: {
    'xxx':'xxxx'
  },

  run: {
    cache: true,
  },

  fmt: {
    tabWidth: 2,
    semi: false,
    printWidth: 100,
    singleQuote: true,
    endOfLine: 'lf',
    trailingComma: 'all',
    sortImports: {},
    sortPackageJson: true,
    ignorePatterns: [
      'pnpm-lock.yaml',
      'package-lock.json',
      'routeTree.gen.ts',
      '.output',
      '.vinxi',
      '.tanstack',
      'dist',
      'node_modules',
      'supabase/.temp',
      'docs/**',
    ],
  },

  lint: {
    plugins: ['typescript', 'react', 'react-perf', 'jsx-a11y'],
    jsPlugins: [
      { name: 'vite-plus', specifier: 'vite-plus/oxlint-plugin' },
      { name: 'react-hooks-js', specifier: 'eslint-plugin-react-hooks' },
      { name: 'eslint-tanstack-router', specifier: '@tanstack/eslint-plugin-router' },
      { name: 'eslint-tanstack-query', specifier: '@tanstack/eslint-plugin-query' },
    ],
    env: {
      builtin: true,
      node: true,
      browser: true,
    },
    options: {
      typeAware: true,
      typeCheck: true,
    },
    rules: {
      'vite-plus/prefer-vite-plus-imports': 'error',
      'typescript/no-floating-promises': 'off',
      'jsx-a11y/control-has-associated-label': 'off',
      'eslint-tanstack-router/create-route-property-order': 'warn',
      'eslint-tanstack-query/exhaustive-deps': 'warn',
      'react-hooks-js/config': 'error',
      'react-hooks-js/rules-of-hooks': 'error',
    },
    ignorePatterns: ['dist', '.output', 'build/', 'node_modules/', 'supabase/.temp/'],
  },
})
