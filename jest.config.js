const config = {
  verbose: true,
  // testEnvironment: 'node',
  automock: false,
  setupFiles: [],
  moduleNameMapper: {
    '^@src/(.*)$': '<rootDir>/src/$1',
    '^@tests/(.*)$': '<rootDir>/tests/$1',
  },
}

// eslint-disable-next-line no-undef
module.exports = config
