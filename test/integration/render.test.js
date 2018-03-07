const path = require('path');
const glob = require('glob');
const chai = require('chai');
const exquisite = require('exquisite-sst');

chai.use(require('chai-as-promised'));

let options = {
    delay: 4000,
    viewportWidth: 800,
    viewportHeight: 600,
    headless: process.platform === 'linux'
    // waitForFn: () => window.mapLoaded
};

const renderDir = path.join(__dirname, 'render');

describe('Render tests:', () => {
    const files = glob.sync(path.join(renderDir, '**', 'test.html'));
    files.forEach(test);
});

function test (file) {
    it(testName(file), () => {
        options.url = `file://${file}`;
        options.input = `${file.replace('.html', '.png')}`;
        options.output = `${file.replace('.html', '_out.png')}`;
        return chai.expect(exquisite.test(options)).to.eventually.be.true;
    }).timeout(5000);
}

function testName (file) {
    return file.substr(renderDir.length, file.length - renderDir.length - 10);
}
