const currentGitBranch = require('current-git-branch');
const webdriver = require('selenium-webdriver');
const assert = require('assert');

const username = process.env.SAUCELABS_USER;
const accessKey = process.env.SAUCELABS_KEY;

const BROWSERS = require('./browsers-target');

describe('CARTO VL browser tests in...', () => {
    const BASE_URL = 'http://localhost:8080/test/browsers/';
    const branch = currentGitBranch();

    // for each test...
    let driver;
    let succesfulTest;

    function getDriverFor (browser, testName) {
        const serverUrl = 'http://localhost:4445/wd/hub';
        // const serverUrl = `http://${username}:${accessKey}@ondemand.saucelabs.com:80/wd/hub`;

        let capabilities = {
            'browserName': browser.browserName,
            'platform': browser.platform,
            'version': browser.version,
            'username': username,
            'accessKey': accessKey,
            'name': `CARTO VL - ${testName}`,
            'build': `CARTO VL [${branch}]`,
            'tags': ['carto-vl', branch],
            'tunnel-identifier': 'cartovl-tunnel'
        };

        driver = new webdriver.Builder()
            .withCapabilities(capabilities)
            .usingServer(serverUrl)
            .build();

        driver.getSession().then(function (sessionid) {
            driver.sessionID = sessionid.id_;
        });
    }

    function testBasicLayerLoads (done) {
        const BASIC_TEST = `${BASE_URL}basic-test.html`;
        // const BASIC_TEST = 'https://carto.com/developers/carto-vl/examples/maps/basics/add-layer.html';

        driver.get(BASIC_TEST);
        const WAIT_MILISECONDS = 10000;
        driver.sleep(WAIT_MILISECONDS);
        driver.findElement({ id: 'loader' }).getCssValue('opacity').then(function (opacity) {
            const loadingIsHidden = (opacity === '0');
            succesfulTest = loadingIsHidden;
            assert(loadingIsHidden, `The <loading> indicator is still visible after ${WAIT_MILISECONDS / 1000} seconds, so the Layer has NOT loaded!`);
            done();
        });
    }

    BROWSERS.forEach((browser) => {
        const { platform, browserName, version } = browser;
        const testName = `${platform} / ${browserName} ${version}`;

        describe(testName, function () {
            this.timeout(40000);

            beforeEach(function (done) {
                succesfulTest = false;
                getDriverFor(browser, testName);
                done();
            });

            it(`${testName} should load a basic VL Layer`, function (done) {
                testBasicLayerLoads(done);
            });
        });
    });

    afterEach(function (done) {
        // Annotate saauce-labs test with every test result
        driver.executeScript('sauce:job-result=' + (succesfulTest ? 'passed' : 'failed'));
        driver.quit();
        done();
    });
});
