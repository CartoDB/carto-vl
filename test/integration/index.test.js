const serve = require('serve');
const exquisite = require('exquisite-sst');
const path = require('path');
const expect = require('chai').expect;
const fs = require('fs');
const DELAY = 5000;


// Use cloudinary to upload screenshots for manual debugging
// const cloudinary = require('cloudinary');

// cloudinary.config({
//     cloud_name: 'iagolast',
//     api_key: process.env.API_KEY,
//     api_secret: process.env.API_SECRET
// });



describe('index.html', () => {
    let server;
    before(done => {
        server = serve(path.join(__dirname, '../../'), {
            port: 5555,
        });
        done();
    });
    it('Rendered image should be the same', () => {
        const input = path.resolve(__dirname, 'reference/i1.png');
        const output = path.resolve(__dirname, 'reference/i1_out.png');
        const URL = 'http://localhost:5555/example/editor/index.html#eyJhIjoidHhfMDEyNV9jb3B5X2NvcHkiLCJiIjoiOGExNzRjNDUxMjE1Y2I4ZGNhOTAyNjRkZTM0MjYxNDA4N2M0ZWYwYyIsImMiOiJkbWFuemFuYXJlcy1kZWQxMyIsImQiOiJjYXJ0by1zdGFnaW5nLmNvbSIsImUiOiJ3aWR0aDogM1xuY29sb3I6IHJnYmEoMC44LDAsMCwxKSIsImYiOnsibG5nIjoyLjE3LCJsYXQiOjQxLjM4fSwiZyI6MTN9';
        return exquisite.test({ input, output, url: URL, delay: DELAY}).then(result => {
            expect(result).to.equal(true);
            fs.unlinkSync(output);
        });
    });
    after(() => {
        server.stop();
    });
});
