module.exports = {
    testEnvironment: 'node',
    collectCoverage: true,
    collectCoverageFrom: [
      'backend/utils/**/*.js',
      'backend/middleware/**/*.js',
      'backend/models/**/*.js', 
    ],
    coverageDirectory: 'coverage',
    reporters: [
      'default',
      ['jest-html-reporter', {
        pageTitle: 'Relatório de Testes NexTask',
        outputPath: 'tests/report/test-report.html',
        includeFailureMsg: true,
        includeSuiteFailure: true,
        theme: 'lightTheme'
      }]
    ]
  };
  