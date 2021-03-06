// Testacular configuration
// Generated on Sat Dec 15 2012 13:08:23 GMT+0000 (GMT)

// base path, that will be used to resolve files and exclude
basePath = '../';
// list of files / patterns to load in the browser
files = [
  JASMINE,
  JASMINE_ADAPTER,

  // our source files.  ordering is important as this isn't packaged code yet.
  './source/utils.js',
  './source/mapFacade.js',
  './source/mapArray.js',
  './source/map.js',
  './source/module.js',

  // our tests
  './tests/unit/*.js'
];

// list of files to exclude
exclude = [
  'n'
];

// test results reporter to use
// possible values: 'dots', 'progress', 'junit'
reporters = ['progress'];

// web server port
port = 8081;

// cli runner port
runnerPort = 9101;

// enable / disable colors in the output (reporters and logs)
colors = true;

// level of logging
// possible values: LOG_DISABLE || LOG_ERROR || LOG_WARN || LOG_INFO || LOG_DEBUG
logLevel = LOG_INFO;

// enable / disable watching file and executing tests whenever any file changes
autoWatch = true;

// Start these browsers, currently available:
// - Chrome
// - ChromeCanary
// - Firefox
// - Opera
// - Safari (only Mac)
// - PhantomJS
// - IE (only Windows)
browsers = ['PhantomJS'];

// If browser does not capture in given timeout [ms], kill it
captureTimeout = 5000;

// Continuous Integration mode
// if true, it capture browsers, run tests and exit
singleRun = false;