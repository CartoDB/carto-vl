const serve = require('serve');
const exquisite = require('exquisite-sst');
const path = require('path');
// const expect = require('chai').expect;
// const fs = require('fs');
const DELAY = 5000;

describe('Basic tests', () => {
    let server;
    before(done => {
        server = serve(path.join(__dirname, '../../'), { port: 5555, });
        done();
    });
    it('single-layer', () => {
        const input = path.resolve(__dirname, 'reference/single-layer.png');
        const output = path.resolve(__dirname, 'reference/single-layer_out.png');
        const URL = 'http://localhost:5000/example/basic/single-layer.html';
        return exquisite.test({ input, output, url: URL, delay: DELAY });
    });
    after(() => {
        server.stop();
    });
});
