const path = require('path');
const chai = require('chai');
const util = require('../common/util');

chai.use(require('chai-as-promised'));

const handler = require('serve-handler');
const http = require('http');
const exquisite = require('exquisite-sst');

const files = util.loadFiles(path.join(__dirname, 'e2e'));
const template = util.loadTemplate(path.join(__dirname, 'e2e.html.tpl'));

describe('E2E tests:', () => {
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

    files.forEach(file => {
        it(util.getName(file), () => {
            const actual = util.testSST(file, template, browser);
            if (!file.match(/skip-render-check/)) {
                // Threshold to cover small renderer between different environments
                return chai.expect(actual).to.eventually.be.at.most(1);
            }
            return actual;
        });
    });

    after(done => {
        server.close();
        exquisite.release(browser).then(done);
    });
});
