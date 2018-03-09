const exquisite = require('exquisite-sst');
const util = require('./render.util');

let options = util.loadOptions();

const files = util.loadFiles();
const renderTemplate = util.loadTemplate();

files.reduce((promise, file) => {
    return promise.then(() => takeReference(file));
}, Promise.resolve());

function takeReference (file) {
    console.log(`Taking reference from ${util.getName(file)}`);
    util.writeTemplate(file, renderTemplate);
    options.url = `file://${util.getHTML(file)}`;
    options.output = `${util.getPNG(file)}`;
    return exquisite.getReference(options);
}
