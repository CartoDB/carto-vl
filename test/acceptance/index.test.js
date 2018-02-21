const fs = require('fs');
const exquisite = require('exquisite-sst');
const path = require('path');
const chai = require('chai');
chai.use(require('chai-as-promised'));
const expect = chai.expect;

const REFERENCES_FOLDER = 'references';
const DELAY = 5000;
// Headless chrome with GPU only works with linux
const HEADLESS = false;//(process.platform === 'linux');
const references = _flatten(_getReferences(REFERENCES_FOLDER));


describe('Screenshot tests:', () => {
    references.forEach(test);
    // test({ folder: 'styling', file: 'rampCategoryAuto' }); // Running a single test
});

// Wrapper to perform a single test.
function test({ folder, file }) {
    file = file.replace('.png', '');
    it(file, () => {
        const input = path.resolve(__dirname, `./${REFERENCES_FOLDER}/${folder}/${file}.png`);
        const output = path.resolve(__dirname, `./${REFERENCES_FOLDER}/${folder}/${file}_out.png`);
        const filepath = path.resolve(__dirname, `./test-cases/${folder}/${file}.html`);
        const URL = `file://${filepath}`;
        return expect(exquisite.test({ input, output, url: URL, delay: DELAY, threshold: 0.2, headless: HEADLESS })).to.eventually.be.true;
    });
}

// Return an array reference objects, a reference object has 2 fields, the folder and the reference itself.
function _getReferences(referencesFolder) {
    const folders = fs.readdirSync(path.join(__dirname, `${referencesFolder}`)).filter(folder => folder !== '.gitignore');

    return folders.map(folder => {
        return fs.readdirSync(path.join(__dirname, `${referencesFolder}/${folder}`))
            .filter(filename => filename.endsWith('.png') && !filename.endsWith('_out.png'))
            .map(file => {
                return {
                    folder: folder,
                    file: file
                };
            });
    });
}

// Transform an array of arrays in a single array
function _flatten(arrays) {
    return [].concat.apply([], arrays);
}
