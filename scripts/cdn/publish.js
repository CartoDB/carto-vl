/**
 * Publish packages to our CDN
 */

const secrets = require('../../secrets.json');
const AWS = require('aws-sdk');

const path = require('path');
const fs = require('fs');
const zlib = require('zlib');
const { promisify } = require('util');
const readdir = promisify(fs.readdir);
const readFile = promisify(fs.readFile);
const gzip = promisify(zlib.gzip);

let semver = require('semver');
let S3;

const BASE_LIBRARY = 'carto-vl';
const BASE_DIST = 'dist';

function checkSecrets () {
    if (!secrets ||
        !secrets.AWS_USER_S3_KEY ||
        !secrets.AWS_USER_S3_SECRET ||
        !secrets.AWS_S3_BUCKET) {
        throw Error('secrets.json content is not valid');
    }
}

function versionFromPackage () {
    let version = require('../../package.json').version;

    if (!version || !semver.valid(version)) {
        throw Error('package.json version is not valid');
    }

    return version;
}

function cdnReleaseUrlsFor (version) {
    // Publish to CDN
    // E.g.
    //   v1.2.3: v1 / v1.2 / v1.2.3
    //   v1.2.3-beta.4: v1.2.3-beta / v1.2.3-beta.4
    let major = semver.major(version);
    let minor = semver.minor(version);
    let patch = semver.patch(version);
    let prerelease = semver.prerelease(version);

    const cdnPaths = [];
    if (prerelease) {
        /**
        * Publish prerelease URLs
        */
        let base = 'v' + major + '.' + minor + '.' + patch + '-';
        if (prerelease[0]) { // alpha, beta, rc
            cdnPaths.push(base + prerelease[0]);
        }
        if (prerelease[1]) { // number
            cdnPaths.push(base + prerelease[0] + '.' + prerelease[1]);
        }
    } else {
        /**
        * Publish release URLs
        */
        cdnPaths.push('v' + major);
        cdnPaths.push('v' + major + '.' + minor);
        cdnPaths.push('v' + major + '.' + minor + '.' + patch);
    }
    return cdnPaths;
}

function configureS3Connection () {
    AWS.config.update({
        accessKeyId: secrets.AWS_USER_S3_KEY,
        secretAccessKey: secrets.AWS_USER_S3_SECRET
    }, true);

    S3 = new AWS.S3();
}

async function uploadFiles (folder) {
    console.log('Publish', folder);

    let files;
    try {
        files = await readdir(BASE_DIST);
    } catch (e) {
        console.error(e);
        return;
    }

    for (const fileName of files) {
        if (isValidFile(fileName)) {
            compressAndUploadFile(folder, fileName);
        }
    }
}

function isValidFile (fileName) {
    const validExtensions = ['.js', '.map'];
    const validExt = validExtensions.includes(path.extname(fileName));
    return validExt && fileName.startsWith('carto-vl');
}

async function compressAndUploadFile (folder, fileName) {
    const gzfileContent = await gzippedFileContent(fileName);
    const fileToUpload = `${folder}/${fileName}`;

    if (DRY_RUN) { // no effective upload
        console.log(`[DRY_RUN] ${fileToUpload} fake upload`);
    } else { // real CDN upload!
        await uploadFileToS3(fileToUpload, gzfileContent);
    }
}

async function uploadFileToS3 (filePath, gzFileContent) {
    const s3Params = {
        ACL: 'public-read',
        Bucket: secrets.AWS_S3_BUCKET,
        Key: filePath,
        Body: gzFileContent,
        ContentEncoding: 'gzip',
        ContentType: getContentTypeFor(filePath)
    };

    await S3.upload(s3Params, function (err, data) {
        if (err) {
            console.log(`Error uploading ${filePath}: ${err}`);
        } if (data) {
            console.log(`[${filePath}] uploaded!`);
        }
    });
}

function getContentTypeFor (filePath) {
    const ext = path.extname(filePath);
    switch (ext) {
        case '.js':
            return 'application/javascript';
        case '.map':
            return 'application/json';
        default:
            throw new Error(`Unexpected extension ${ext} for file being uploaded. Double check it!`);
    }
}

async function gzippedFileContent (fileName) {
    const localFile = `${BASE_DIST}/${fileName}`;
    let fileContent = await readFile(localFile);
    fileContent = await gzip(fileContent);
    return fileContent;
}

async function publishRelease () {
    const version = versionFromPackage();
    const cdnUrls = cdnReleaseUrlsFor(version);
    cdnUrls.forEach(async (url) => {
        const targetFolder = `${BASE_LIBRARY}/${url}`;
        await uploadFiles(targetFolder);
    });
}

function getCurrentBranch () {
    const currentGitBranch = require('current-git-branch');
    const branch = currentGitBranch();
    return branch;
}

function publishCurrentBranch () {
    const branch = getCurrentBranch();
    const targetFolder = `${BASE_LIBRARY}/branches/${branch}`;
    uploadFiles(targetFolder);
}

function publish (mode) {
    checkSecrets();
    configureS3Connection();

    if (mode === 'release') {
        console.log('VAMOS! let\'s go for a Release...');
        publishRelease();
    } else if (mode === 'current_branch') {
        console.log('Let\'s just publish the current Branch...');
        publishCurrentBranch();
    } else {
        throw new Error('Not a valid publishing mode, use RELEASE or CURRENT_BRANCH');
    }
}

// main -----------------------------------------------
const args = process.argv;
const mode = args[2];
const DRY_RUN = args.some(arg => arg === '--dry-run');
const prefix = DRY_RUN ? '[DRY_RUN]' : '[CDN PUBLICATION]';
console.log(`${prefix} Publishing ${mode} for ${BASE_LIBRARY}`);

publish(mode);
