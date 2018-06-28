const path = require('path');
const util = require('../common/util');
const http = require('http');
const handler = require('serve-handler');

const files = util.loadFiles(path.join(__dirname, 'e2e'));
const template = util.loadTemplate(path.join(__dirname, 'e2e.html.tpl'));

let server = http.createServer(handler);
server.listen(util.PORT);

files.reduce((promise, file) => {
    return promise.then(() => util.takeReference(file, template, true));
}, Promise.resolve()).then(() => {
    server.close();
});
