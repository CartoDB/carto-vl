const path = require('path');
const chai = require('chai');
const util = require('../../common/util');

chai.use(require('chai-as-promised'));

const handler = require('serve-handler');
const http = require('http');
const exquisite = require('exquisite-sst');

const files = util.loadFiles(path.join(__dirname, 'scenarios'));
const template = util.loadTemplate(path.join(__dirname, 'render.html.tpl'));

const currentPackage = require('../../../package.json');

describe('Render tests:', () => {
    let server;
    let browser;

    before(done => {
        server = http.createServer(handler);
        server.listen(util.PORT);
        exquisite.browser(util.headless()).then(_browser => {
            browser = _browser;
            done();
        });
    });

    console.log(`Tests will run for current mapbox-gl version: ${currentPackage.devDependencies['mapbox-gl']}`);
    files.forEach(file => {
        it(util.getName(file), () => {
            const actual = util.testSST(file, template, browser);
            // Temporary threshold (1px) to cover small renderer differences between Mac & Linux
            return chai.expect(actual).to.eventually.be.at.most(1);
        });
    });

    describe('with previous Mapbox GL versions...', () => {
        const previousVersions = currentPackage.previousMapboxGLVersions; // TODO push up in config.
        console.log(`Tests will run these previous versions: ${previousVersions.join(', ')}`);
        const mapboxVersions = previousVersions.map((version) => {
            return {
                name: version,
                js: `https://api.tiles.mapbox.com/mapbox-gl-js/${version}/mapbox-gl.js`,
                css: `https://api.tiles.mapbox.com/mapbox-gl-js/${version}/mapbox-gl.css`
            };
        });

        mapboxVersions.forEach((mapboxVersion) => {
            describe(mapboxVersion.name, () => {
                files.forEach(file => {
                    it(util.getName(file), () => {
                        const actual = util.testSST(file, template, browser, mapboxVersion);
                        // Temporary threshold (1px) to cover small renderer differences between Mac & Linux
                        return chai.expect(actual).to.eventually.be.at.most(1);
                    });
                });
            });
        });
    });

    after(done => {
        server.close();
        exquisite.release(browser).then(done);
    });
});
