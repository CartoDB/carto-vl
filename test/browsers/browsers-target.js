// See https://wiki.saucelabs.com/display/DOCS/Platform+Configurator# for a list of supported options
const browsers = [
    { 'platform': 'Windows 10', 'browserName': 'chrome', 'version': 'latest' },
    { 'platform': 'Windows 10', 'browserName': 'firefox', 'version': 'latest' },
    { 'platform': 'Windows 10', 'browserName': 'MicrosoftEdge', 'version': 'latest' },

    { 'platform': 'macOS 10.14', 'browserName': 'chrome', 'version': 'latest' },
    { 'platform': 'macOS 10.14', 'browserName': 'firefox', 'version': 'latest' },
    { 'platform': 'macOS 10.14', 'browserName': 'safari', 'version': 'latest' }

    // { 'platform': 'Linux', 'browserName': 'chrome', 'version': 'latest' },
    // { 'platform': 'Linux', 'browserName': 'firefox', 'version': 'latest' },
];

module.exports = browsers;
