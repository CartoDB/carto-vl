const path = require('path');
const chai = require('chai');
const util = require('../common/util');

chai.use(require('chai-as-promised'));

const files = util.loadFiles(path.join(__dirname, 'e2e'));
const template = util.loadTemplate(path.join(__dirname, 'e2e.html.tpl'));

describe('E2E tests:', () => {
    files.forEach(test);
});

function test(file) {
    it(util.getName(file), () => {
        const actual = util.testSST(file, template, true);
        return chai.expect(actual).to.eventually.be.true;
    }).timeout(20000);
}
