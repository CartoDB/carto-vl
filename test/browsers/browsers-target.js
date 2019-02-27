// See https://wiki.saucelabs.com/display/DOCS/Platform+Configurator# for a list of supported options
const browsers = [
    { 'platform': 'Windows 10', 'browserName': 'googlechrome', 'version': 'latest' },
    { 'platform': 'Windows 10', 'browserName': 'firefox', 'version': 'latest' },
    { 'platform': 'Windows 10', 'browserName': 'MicrosoftEdge', 'version': 'latest' },

    // TODO Fix SauceLabs tests to run on macOS #1272
    { 'platform': 'macOS 10.14', 'browserName': 'googlechrome', 'version': 'latest' },
    { 'platform': 'macOS 10.14', 'browserName': 'firefox', 'version': 'latest' },
    { 'platform': 'macOS 10.14', 'browserName': 'safari', 'version': 'latest' }
];

module.exports = browsers;
