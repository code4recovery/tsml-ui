/** @type {import("@jest/types").Config.InitialOptions} */
module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  collectCoverageFrom: [
    '<rootDir>/src/**/*.(j|t)s*',
    '!<rootDir>/src/(types|i18n)/*',
    '!<rootDir>/**/__snapshots__/*',
    '!<rootDir>/e2e/**/*',
    '!<rootDir>/src/**/index.ts',
  ],
  testPathIgnorePatterns: ['e2e'],
};
