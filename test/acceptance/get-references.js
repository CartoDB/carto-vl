
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const FOLDERS = ['basic', 'styling'];
const DELAY = 8000;
// Headless chrome with GPU only works with linux
const HEADLESS_FLAG = (process.platform === 'linux') ? '--headless' : '';

const BLACKLIST_FILES = ['ships.html', 'now.html'];

FOLDERS.forEach(getReferences);


/**
 * Uses exquisite-sst from the command line to take screenshots of all html files on a folder
 * @param {*} folder
 */
function getReferences(folder) {
    const files = fs.readdirSync(path.join(__dirname, `../../example/${folder}`));

    files.forEach(file => {
        const filepath = path.resolve(__dirname, `../../example/${folder}/${file}`);
        if (file.endsWith('.html') && !BLACKLIST_FILES.includes(file)) {
            console.log(`Taking reference from ${file}`);
            execSync(`$(npm bin)/exquisite-sst ${HEADLESS_FLAG} --reference --url file://${filepath} --output ./test/acceptance/reference/${folder}/${file.replace('.html', '.png')} --delay ${DELAY}`);
        }
    });
}
