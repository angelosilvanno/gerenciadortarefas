module.exports = {
  testEnvironment: 'node',
  collectCoverage: true,
  collectCoverageFrom: [
    'backend/utils/**/*.js',
    'backend/middleware/**/*.js',
    'backend/models/**/*.js',
  ],
  coverageDirectory: 'coverage',
  reporters: ['default'] 
};
