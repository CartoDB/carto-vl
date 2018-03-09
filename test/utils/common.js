const fs = require('fs');
const path = require('path');
const glob = require('glob');
const template = require('lodash.template');
const exquisite = require('exquisite-sst');

let testsDir = '';
const testFile = 'test.js';

function loadFiles(directory) {
    testsDir = directory;
    return glob.sync(path.join(directory, '**', testFile));
}

function loadTemplate(file) {
    return template(fs.readFileSync(file), 'utf8');
}

function getName(file) {
    return file.substr(
        testsDir.length,
        file.length - testsDir.length - testFile.length - 1
    );
}

function takeReference(file, template) {
    console.log(`Taking reference from ${getName(file)}`);
    writeTemplate(file, template);
    let options = loadOptions();
    options.url = `file://${getHTML(file)}`;
    options.output = `${getPNG(file)}`;
    return exquisite.getReference(options);
}

function testSST(file, template) {
    writeTemplate(file, template);
    let options = loadOptions();
    options.url = `file://${getHTML(file)}`;
    options.input = `${getPNG(file)}`;
    options.output = `${getOutPNG(file)}`;
    return exquisite.test(options);
}

function writeTemplate(file, template) {
    const mainDir = path.resolve(__dirname, '..', '..');
    const geojsonDir = path.resolve(path.dirname(file), '..', 'test.geojson');
    const geojson = fs.existsSync(geojsonDir) ? fs.readFileSync(geojsonDir) : '';
    fs.writeFileSync(getHTML(file), template({
        file: file,
        geojson: geojson,
        cartogl: path.join(mainDir, 'dist', 'carto-gl.js'),
        mapboxgl: path.join(mainDir, 'vendor', 'mapbox-gl-dev.js'),
        mapboxglcss: path.join(mainDir, 'vendor', 'mapbox-gl-dev.css')
    }));
}


function getHTML(file) {
    return file.replace('.js', '.html');
}

function getPNG(file) {
    return file.replace('.js', '.png');
}

function getOutPNG(file) {
    return file.replace('.js', '_out.png');
}

function loadOptions() {
    return {
        delay: 100,
        viewportWidth: 400,
        viewportHeight: 300,
        headless: process.platform === 'linux'
    };
}

module.exports = {
    getName,
    loadFiles,
    loadTemplate,
    takeReference,
    testSST
};
