const path = require('path');
module.exports = {
  verbose: true,
  setupFilesAfterEnv: [path.resolve(__dirname, './setupTests.ts')],
  testEnvironment: 'jest-environment-jsdom-sixteen',
  moduleNameMapper: {
    '\\.(css|less)$': path.resolve(__dirname, './__mocks__/styleMock.js'),
    '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$': path.resolve(
      __dirname,
      './__mocks__/fileMock.js'
    ),
    '@patternfly/react-code-editor': path.resolve(
      __dirname,
      './__mocks__/react-code-editor.js'
    ),
    '@bf2/ui-shared': path.resolve(__dirname, './__mocks__/bf2uisharedMock.js'),
  },
  globals: {
    'ts-jest': {
      tsconfig: 'tsconfig.test.json',
    },
  },
};
