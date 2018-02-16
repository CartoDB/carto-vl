
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const serve = require('serve');
const PORT = 5556;

const server = serve(path.join(__dirname, '../../'), { port: PORT, });
const FOLDERS = ['basic', 'styling'];

FOLDERS.forEach(getReferences);

server.stop();


/**
 * Uses exquisite-sst from the command line to take screenshots of all html files on a folder
 * @param {*} folder 
 */
function getReferences(folder) {
    const files = fs.readdirSync(path.join(__dirname, `../../example/${folder}`));
    files.forEach(file => {
        if (file.endsWith('.html')) {
            execSync(`$(npm bin)/exquisite-sst --reference --url http://localhost:${PORT}/example/${folder}/${file} --output ./test/acceptance/reference/${folder}/${file.replace('.html', '.png')} --delay 8000`);
        }
    });
}
