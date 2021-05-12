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
  },
  globals: {
    'ts-jest': {
      tsConfig: 'tsconfig.test.json',
    },
  },
};
