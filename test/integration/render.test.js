const exquisite = require('exquisite-sst');
const chai = require('chai');
const util = require('./util');

chai.use(require('chai-as-promised'));

let options = util.loadOptions();

const files = util.loadFiles();
const renderTemplate = util.loadTemplate();

describe('Render tests:', () => {
    files.forEach(test);
});

function test (file) {
    it(util.getName(file), () => {
        util.writeTemplate(file, renderTemplate);
        options.url = `file://${util.getHTML(file)}`;
        options.input = `${util.getPNG(file)}`;
        options.output = `${util.getOutPNG(file)}`;
        return chai.expect(exquisite.test(options)).to.eventually.be.true;
    }).timeout(10000);
}
