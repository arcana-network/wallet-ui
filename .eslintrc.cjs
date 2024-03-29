module.exports = {
  root: true,
  extends: [
    'plugin:vue/vue3-recommended',
    'eslint:recommended',
    '@vue/eslint-config-typescript/recommended',
    '@vue/eslint-config-prettier',
  ],
  env: {
    'vue/setup-compiler-macros': true,
  },
  plugins: ['import'],
  rules: {
    'no-restricted-imports': ['error', { patterns: ['.*'] }],
    'import/first': 'error',
    'import/exports-last': 'error',
    'import/no-duplicates': 'error',
    'import/no-namespace': 'error',
    'import/order': [
      'error',
      {
        pathGroups: [
          {
            pattern: '@/',
            group: 'internal',
          },
        ],
        groups: ['builtin', 'external', ['internal', 'parent', 'sibling']],
        'newlines-between': 'always',
        alphabetize: {
          order: 'asc',
          caseInsensitive: true,
        },
      },
    ],
    'import/newline-after-import': 'error',
    'import/no-anonymous-default-export': 'error',
    'import/group-exports': 'error',
    'vue/component-tags-order': [
      'error',
      {
        order: ['script', 'template', 'style'],
      },
    ],
    'vue/no-empty-component-block': 'error',
  },
}
