/** @type {import("@jest/types").Config.InitialOptions} */
module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  collectCoverageFrom: [
    '<rootDir>/src/**/*.(j|t)s*',
    '!<rootDir>/src/(types|i18n)/*',
    '!<rootDir>/**/__snapshots__/*',
    '!<rootDir>/src/**/index.ts',
  ],
  moduleNameMapper: {
    '\\.(css)$': '<rootDir>/test/__mocks__/styleMock.js',
  },
  transformIgnorePatterns: [
    '/node_modules/(?!(react-leaflet|@react-leaflet|leaflet)/)',
  ],
};
