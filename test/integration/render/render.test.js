const path = require('path');
const chai = require('chai');
const util = require('../../common/util');

chai.use(require('chai-as-promised'));

const handler = require('serve-handler');
const http = require('http');
const exquisite = require('exquisite-sst');

const files = util.loadFiles(path.join(__dirname, 'scenarios'));
const template = util.loadTemplate(path.join(__dirname, 'render.html.tpl'));

describe('Render tests:', async () => {
    let server;
    let browser;

    before(async () => {
        server = http.createServer(handler);
        server.listen(util.PORT);
        browser = await exquisite.browser();
    });

    after(done => {
        server.close();
        exquisite.release(browser).then(done);
    });

    files.forEach(file => {
        it(util.getName(file), () => {
            const actual = util.testSST(file, template, true, browser);
            // Temporary threshold (1px) to cover small renderer differences between Mac & Linux
            return chai.expect(actual).to.eventually.be.at.most(1);
        }).timeout(10000);
    });
});
