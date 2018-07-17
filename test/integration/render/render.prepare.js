const path = require('path');
const util = require('../../common/util');

const handler = require('serve-handler');
const http = require('http');

const files = util.loadFiles(path.join(__dirname, 'scenarios'));
const template = util.loadTemplate(path.join(__dirname, 'render.html.tpl'));

let server = http.createServer(handler);
server.listen(util.PORT);

files.reduce((promise, file) => {
    return promise.then(() => util.takeReference(file, template));
}, Promise.resolve()).then(() => {
    server.close();
});
