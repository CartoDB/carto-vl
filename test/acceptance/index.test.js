const serve = require('serve');
const exquisite = require('exquisite-sst');
const path = require('path');
const chai = require('chai');
chai.use(require('chai-as-promised'));

const expect = chai.expect;
const DELAY = 3000;
var server;


describe('Screenshot tests:', () => {
    before(done => {
        server = serve(path.join(__dirname, '../../'), { port: 5555, });
        done();
    });
    it('single-layer', () => {
        const input = path.resolve(__dirname, 'reference/single-layer.png');
        const output = path.resolve(__dirname, 'reference/single-layer_out.png');
        const URL = 'http://localhost:5000/example/basic/single-layer.html';
        return expect(exquisite.test({ input, output, url: URL, delay: DELAY })).to.eventually.be.true;
    });

    after(() => {
        server.stop();
    });
});

