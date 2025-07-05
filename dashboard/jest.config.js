module.exports = {
  testEnvironment: 'jsdom',
  transform: {
    '^.+\\.jsx?$': 'babel-jest',
  },
  moduleFileExtensions: ['js', 'jsx'],
  setupFilesAfterEnv: ['./jest.setup.js'],
  moduleNameMapper: {
      '^.+\\.(svg)$': '<rootDir>/__mocks__/fileMock.js',
    },
};
