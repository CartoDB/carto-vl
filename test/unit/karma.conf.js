const webpackConfig = process.env.MIN
    ? require('../../webpack/webpack.min.config.js')
    : require('../../webpack/webpack.config.js');

// Disable bundle warnings
webpackConfig.performance = webpackConfig.performance || {};
webpackConfig.performance.hints = false;

module.exports = function (config) {
    config.set({
        frameworks: ['jasmine'],
        files: ['index.test.js'],
        reporters: ['mocha'],
        mochaReporter: {
            ignoreSkipped: true
        },
        port: 9876, // karma web server port
        colors: true,
        logLevel: config.LOG_INFO,
        browsers: ['ChromeHeadlessNoSandbox'],
        autoWatch: false,
        singleRun: false,
        concurrency: Infinity,
        preprocessors: {
            'index.test.js': ['webpack', 'sourcemap']
        },
        webpack: webpackConfig,
        customLaunchers: {
            // Add no-sandbox flag due a bug. https://github.com/karma-runner/karma-chrome-launcher/issues/158
            ChromeHeadlessNoSandbox: {
                base: 'ChromeHeadless',
                flags: ['--no-sandbox']
            }
        }
    });
};
