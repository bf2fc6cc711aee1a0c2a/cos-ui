module.exports = {
  parser: '@typescript-eslint/parser',
  extends: ['prettier', 'plugin:jest-dom/recommended', 'plugin:react-hooks/recommended', 'plugin:xstate/all', 'plugin:storybook/recommended'],
  plugins: ['@typescript-eslint', 'react-hooks', 'jest-dom', 'testing-library', 'xstate'],
  settings: {
    react: {
      version: '999.999.999'
    }
  },
  overrides: [{
    // 3) Now we enable eslint-plugin-testing-library rules or preset only for matching files!
    files: ['**/__tests__/**/*.[jt]s?(x)', 'test/?(*.)+(spec|test).[jt]s?(x)'],
    extends: ['plugin:testing-library/react']
  }],
  rules: {
    'no-unused-vars': 'off',
    '@typescript-eslint/no-unused-vars': 'off'
  }
};