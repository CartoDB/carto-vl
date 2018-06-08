const path = require('path');
const chai = require('chai');
const util = require('../../common/util');

chai.use(require('chai-as-promised'));

const handler = require('serve-handler');
const http = require('http');

const files = util.loadFiles(path.join(__dirname, 'scenarios'));
const template = util.loadTemplate(path.join(__dirname, 'render.html.tpl'));
const PORT = 5000;

describe('Render tests:', () => {
    let server;
    
    before(() => {
        server = http.createServer(handler);
        server.listen(PORT);
    });

    files.forEach(test);

    after(() => {
        server.close();
    });
});

function test(file) {

    it(util.getName(file), () => {
        const actual = util.testSST(file, template);
        // Temporary threshold (1px) to cover small renderer differences between Mac & Linux
        return chai.expect(actual).to.eventually.be.at.most(1);
    }).timeout(10000);
}
