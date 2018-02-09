module.exports = function (config) {
    config.set({
        frameworks: ['jasmine'],
        files: ['test/**/*.test.js'],
        exclude: ['test/acceptance/**'],
        reporters: ['progress'],
        port: 9876,  // karma web server port
        colors: true,
        logLevel: config.LOG_INFO,
        browsers: ['ChromeHeadless'],
        autoWatch: false,
        singleRun: true, // Karma captures browsers, runs the tests and exits
        concurrency: Infinity,
        preprocessors: {
            'test/**/*.test.js': ['webpack', 'sourcemap'],
        },
        webpack: {
            devtool: 'inline-source-map'
        }
    });
};