module.exports = {
  extends: [
    'react-app',

    'prettier', // Enables eslint-plugin-prettier and eslint-config-prettier. This will display prettier errors as ESLint errors. Make sure this is always the last configuration in the extends array.

    'plugin:jest-dom/recommended',
    'plugin:react-hooks/recommended',
    'plugin:xstate/all',
  ],
  plugins: [
    'react-hooks',
    'jest-dom',
    'testing-library',
    'unused-imports',
    'xstate',
  ],
  settings: {
    react: {
      version: '999.999.999',
    },
  },
  overrides: [
    {
      // 3) Now we enable eslint-plugin-testing-library rules or preset only for matching files!
      files: [
        '**/__tests__/**/*.[jt]s?(x)',
        'test/?(*.)+(spec|test).[jt]s?(x)',
      ],
      extends: ['plugin:testing-library/react'],
    },
  ],
  rules: {
    'no-unused-vars': 'off',
    '@typescript-eslint/no-unused-vars': 'off',
    'unused-imports/no-unused-imports': 'error',
    'unused-imports/no-unused-vars': [
      'warn',
      {
        vars: 'all',
        varsIgnorePattern: '^_',
        args: 'after-used',
        argsIgnorePattern: '^_',
      },
    ],
  },
};
