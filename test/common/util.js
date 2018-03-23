const fs = require('fs');
const path = require('path');
const glob = require('glob');
const template = require('lodash.template');
const exquisite = require('exquisite-sst');

let testsDir = '';
const testFile = 'scenario.js';
const sources = loadGeoJSONSources();

function loadFiles(directory) {
    testsDir = directory;
    let files = [];
    let fFiles = [];
    const allFiles = glob.sync(path.join(directory, '**', testFile));
    allFiles.forEach(function (file) {
        const name = getName(file);
        if (!name.includes('/x-')) {
            if (name.includes('/f-')) {
                fFiles.push(file);
            } else {
                files.push(file);
            }
        }
    });
    if (fFiles.length > 0) return fFiles;
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
    options.consoleFn = handleBrowserConsole;
    if (asyncLoad) options.waitForFn = () => window.loaded;
    return exquisite.test(options);
}

function writeTemplate(file, template) {
    const mainDir = path.resolve(__dirname, '..', '..');
    fs.writeFileSync(getHTML(file), template({
        file: file,
        sources: sources,
        cartogl: path.join(mainDir, 'dist', 'carto-gl.js'),
        mapboxgl: path.join(mainDir, 'vendor', 'mapbox-gl-dev.js'),
        mapboxglcss: path.join(mainDir, 'vendor', 'mapbox-gl-dev.css')
    }));
}

function loadGeoJSONSources() {
    const sourcesDir = path.resolve(__dirname, 'sources');
    const geojsonFiles = glob.sync(path.join(sourcesDir, '*.geojson'));
    let sources = {};
    geojsonFiles.forEach(function (geojsonFile) {
        const fileName = path.basename(geojsonFile, '.geojson');
        sources[fileName] = JSON.parse(fs.readFileSync(geojsonFile));
    });
    return JSON.stringify(sources);
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

/**
 * Handle puppeteer output.
 * https://github.com/GoogleChrome/puppeteer/blob/master/docs/api.md#class-consolemessage
 * @param {ConsoleMessage} consoleMessage
 */
function handleBrowserConsole(consoleMessage) {
    if (process.env.VERBOSE_LOG) {
        console.log(consoleMessage.text());
    } else {
        if (consoleMessage.type() === 'warning' || consoleMessage.type() === 'error') {
            console.log(consoleMessage.text());
        }
    }
}

module.exports = {
    getName,
    loadFiles,
    loadTemplate,
    takeReference,
    testSST
};
