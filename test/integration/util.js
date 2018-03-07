const fs = require('fs');
const path = require('path');
const glob = require('glob');
const template = require('lodash.template');

const fileName = 'test.js';
const renderDir = path.join(__dirname, 'render');

function getHTML(file) {
    return file.replace('.js', '.html');
}

function getPNG(file) {
    return file.replace('.js', '.png');
}

function getOutPNG(file) {
    return file.replace('.js', '_out.png');
}

function getGeoJSON(file) {
    return file.replace('.js', '.geojson');
}

function getName(file) {
    return file.substr(
        renderDir.length,
        file.length - renderDir.length - fileName.length - 1
    );
}

function loadOptions() {
    return {
        delay: 1000,
        viewportWidth: 800,
        viewportHeight: 600,
        headless: process.platform === 'linux'
        // waitForFn: () => window.mapLoaded
    };
}

function loadFiles() {
    return glob.sync(path.join(renderDir, '**', fileName));
}

function loadTemplate() {
    return template(fs.readFileSync(path.join(__dirname, 'render.html.tpl')), 'utf8');
}

function writeTemplate(file, renderTemplate) {
    const mainDir = path.resolve(__dirname, '..', '..');
    const geojson = fs.existsSync(getGeoJSON(file)) ? fs.readFileSync(getGeoJSON(file)) : '';
    fs.writeFileSync(getHTML(file), renderTemplate({
        file: file,
        geojson: geojson,
        cartogl: path.resolve(mainDir, 'dist', 'carto-gl.js'),
        mapboxgl: path.resolve(mainDir, 'vendor', 'mapbox-gl-dev.js'),
        mapboxglcss: path.resolve(mainDir, 'vendor', 'mapbox-gl-dev.css')
    }));
}

module.exports = {
    getHTML: getHTML,
    getPNG: getPNG,
    getOutPNG: getOutPNG,
    getName: getName,
    loadFiles: loadFiles,
    loadOptions: loadOptions,
    loadTemplate: loadTemplate,
    writeTemplate: writeTemplate,
};
