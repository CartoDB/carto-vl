const path = require('path');
const util = require('../common/util');

const files = util.loadFiles(path.join(__dirname, 'e2e'));
const template = util.loadTemplate(path.join(__dirname, 'e2e.html.tpl'));

files.reduce((promise, file) => {
    return promise.then(() => util.takeReference(file, template, true));
}, Promise.resolve());
