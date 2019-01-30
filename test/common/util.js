const fs = require('fs');
const path = require('path');
const glob = require('glob');
const template = require('lodash.template');
const exquisite = require('exquisite-sst');

let testsDir = '';
const testFile = 'scenario.js';
const sources = loadGeoJSONSources();
const PORT = 5000;

const mapboxVersion = {
    js: `http://localhost:${PORT}/` + path.join('node_modules', 'mapbox-gl', 'dist', 'mapbox-gl.js'),
    css: `http://localhost:${PORT}/` + path.join('node_modules', 'mapbox-gl', 'dist', 'mapbox-gl.css')
};

function loadFiles (directory) {
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

function loadTemplate (file) {
    return template(fs.readFileSync(file), 'utf8');
}

function getName (file) {
    return file.substr(
        testsDir.length,
        file.length - testsDir.length - testFile.length - 1
    );
}

function takeReference (file, template) {
    if (!fs.existsSync(getPNG(file))) {
        console.log(`Taking reference from ${getName(file)}`);
        writeTemplate(file, template);
        let options = loadOptions();
        options.url = `http://localhost:${PORT}/test/${getLocalhostURL(file)}/scenario.html`;
        options.output = `${getPNG(file)}`;
        options.waitForFn = () => window.loaded;
        return exquisite.getReference(options);
    }
}

function getDeviceScaleFactor (file) {
    const matches = file.match(/@([0-9]*)x/);
    if (matches && matches[1]) {
        return parseInt(matches[1], 10);
    }
    return 1;
}

async function testSST (file, template, browser, mapbox = mapboxVersion) {
    writeTemplate(file, template, mapbox);
    let options = loadOptions();
    options.url = `http://localhost:${PORT}/test/${getLocalhostURL(file)}/scenario.html`;
    options.input = `${getPNG(file)}`;
    options.output = `${getOutPNG(file)}`;
    options.consoleFn = handleBrowserConsole;
    options.deviceScaleFactor = getDeviceScaleFactor(file);
    options.browser = browser;
    const capturedErrors = [];
    options.pageEvents = {
        error: err => {
            console.error(err);
            capturedErrors.push(err);
        },
        pageerror: err => {
            console.error(err);
            capturedErrors.push(err);
        },
        requestfailed: request => {
            const failure = request.failure();
            if (failure) {
                const err = new Error(`Request failed: URL="${request.url()}"; Reason="${failure.errorText}"`);
                console.error(err);
                capturedErrors.push(err);
            }
        }
    };
    options.waitForFn = () => window.loaded;

    const result = await exquisite.test(options);
    if (capturedErrors.length > 0) {
        throw new Error(capturedErrors.map(err => err.message).join(', '));
    }
    return result;
}

function writeTemplate (file, template, mapbox = mapboxVersion) {
    const bundle = process.env.MIN ? 'carto-vl.min' : 'carto-vl';
    fs.writeFileSync(getHTML(file), template({
        file: `http://localhost:${PORT}/test/${getLocalhostURL(file)}/scenario.js`,
        sources: sources,
        cartovl: `http://localhost:${PORT}/dist/${bundle}.js`,
        mapboxgl: mapbox.js,
        mapboxglcss: mapbox.css,
        glmatrix: `http://localhost:${PORT}/` + path.join('node_modules', 'gl-matrix', 'dist', 'gl-matrix-min.js')
    }));
}

function loadGeoJSONSources () {
    const sourcesDir = path.resolve(__dirname, 'sources');
    const geojsonFiles = glob.sync(path.join(sourcesDir, '*.geojson'));
    let sources = {};
    geojsonFiles.forEach(function (geojsonFile) {
        const fileName = path.basename(geojsonFile, '.geojson');
        sources[fileName] = JSON.parse(fs.readFileSync(geojsonFile));
    });
    return JSON.stringify(sources);
}

function getLocalhostURL (file) {
    return file.substr(file.indexOf('test/') + 'test/'.length).replace('/scenario.js', '');
}
function getHTML (file) {
    return file.replace(testFile, 'scenario.html');
}

function getPNG (file) {
    return file.replace(testFile, 'reference.png');
}

function getOutPNG (file) {
    return file.replace(testFile, 'reference_out.png');
}

function loadOptions () {
    return {
        delay: 100,
        viewportWidth: 400,
        viewportHeight: 300,
        headless: headless()
    };
}

function headless () {
    return process.platform === 'darwin' || process.platform === 'linux';
}

/**
 * Handle puppeteer output.
 * https://github.com/GoogleChrome/puppeteer/blob/master/docs/api.md#class-consolemessage
 * @param {ConsoleMessage} consoleMessage
 */
function handleBrowserConsole (consoleMessage) {
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
    testSST,
    headless,
    PORT
};
