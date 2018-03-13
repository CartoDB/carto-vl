const fs = require('fs');
const path = require('path');
const glob = require('glob');
const template = require('lodash.template');
const exquisite = require('exquisite-sst');

let testsDir = '';
let testFile = '';

function loadFiles(directory) {
    testsDir = directory;
    testFile = 'fscenario.js';
    let files = glob.sync(path.join(directory, '**', testFile));
    if (files.length === 0) {
        // If there are no fscenario.js files load all scenario.js files
        testFile = 'scenario.js';
        files = glob.sync(path.join(directory, '**', testFile));
    }
    return files;
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

function takeReference(file, template, asyncLoad) {
    if (!fs.existsSync(getPNG(file))) {
        console.log(`Taking reference from ${getName(file)}`);
        writeTemplate(file, template);
        let options = loadOptions();
        options.url = `file://${getHTML(file)}`;
        options.output = `${getPNG(file)}`;
        if (asyncLoad) options.waitForFn = () => window.loaded;
        return exquisite.getReference(options);
    }
}

function testSST(file, template, asyncLoad) {
    writeTemplate(file, template);
    let options = loadOptions();
    options.url = `file://${getHTML(file)}`;
    options.input = `${getPNG(file)}`;
    options.output = `${getOutPNG(file)}`;
    if (asyncLoad) options.waitForFn = () => window.loaded;
    return exquisite.test(options);
}

function writeTemplate(file, template) {
    const mainDir = path.resolve(__dirname, '..', '..');
    const geojsonDir = path.resolve(path.dirname(file), '..', 'data.geojson');
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
    return file.replace(testFile, 'scenario.html');
}

function getPNG(file) {
    return file.replace(testFile, 'reference.png');
}

function getOutPNG(file) {
    return file.replace(testFile, 'reference_out.png');
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
