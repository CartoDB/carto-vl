const path = require('path');
const glob = require('glob');
const exquisite = require('exquisite-sst');

let options = {
    delay: 4000,
    viewportWidth: 800,
    viewportHeight: 600,
    headless: process.platform === 'linux'
    // waitForFn: () => window.mapLoaded
};

const renderDir = path.join(__dirname, 'render');

glob(path.join(renderDir, '**', 'test.html'), {}, function (error, files) {
    files.reduce((promise, file) => {
        return promise.then(() => takeReference(file));
    }, Promise.resolve());
});

function takeReference (file) {
    console.log(`Taking reference from ${testName(file)}`);
    options.url = `file://${file}`;
    options.output = `${file.replace('.html', '.png')}`;
    return exquisite.getReference(options);
}

function testName (file) {
    return file.substr(renderDir.length, file.length - renderDir.length - 10);
}
