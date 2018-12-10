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

const TARGET = 'carto-vl';
// const TARGET = 'carto-vl-test';

function checkSecrets () {
    if (!secrets ||
        !secrets.AWS_USER_S3_KEY ||
        !secrets.AWS_USER_S3_SECRET ||
        !secrets.AWS_S3_BUCKET) {
        throw Error('secrets.json content is not valid');
    }
}

function verifiedPackageVersion () {
    let version = require('../../package.json').version;

    if (!version || !semver.valid(version)) {
        throw Error('package.json version is not valid');
    }

    return version;
}

function publishToCDN (version) {
    configureS3Connection();

    // Publish to CDN
    // E.g.
    //   v1.2.3: v1 / v1.2 / v1.2.3
    //   v1.2.3-beta.4: v1.2.3-beta / v1.2.3-beta.4
    let major = semver.major(version);
    let minor = semver.minor(version);
    let patch = semver.patch(version);
    let prerelease = semver.prerelease(version);

    if (prerelease) {
        /**
        * Publish prerelease URLs
        */
        let base = 'v' + major + '.' + minor + '.' + patch + '-';
        if (prerelease[0]) { // alpha, beta, rc
            uploadFiles(base + prerelease[0]);
        }
        if (prerelease[1]) { // number
            uploadFiles(base + prerelease[0] + '.' + prerelease[1]);
        }
    } else {
        /**
        * Publish release URLs
        */
        uploadFiles('v' + major);
        uploadFiles('v' + major + '.' + minor);
        uploadFiles('v' + major + '.' + minor + '.' + patch);
    }
}

function configureS3Connection () {
    AWS.config.update({
        accessKeyId: secrets.AWS_USER_S3_KEY,
        secretAccessKey: secrets.AWS_USER_S3_SECRET
    }, true);

    S3 = new AWS.S3();
}

async function uploadFiles (version) {
    console.log('Publish', version);

    let files;
    try {
        files = await readdir('dist');
    } catch (e) {
        console.error(e);
        return;
    }

    const uploadExtensions = ['.js', '.map'];
    for (const fileName of files) {
        const validFile = uploadExtensions.includes(path.extname(fileName));
        if (validFile) {
            await compressAndUploadFile(version, fileName);
        }
    }
}

async function compressAndUploadFile (version, fileName) {
    // gzip file
    const localFile = `dist/${fileName}`;
    let fileContent = await readFile(localFile);
    fileContent = await gzip(fileContent);

    // upload gzipped content
    const s3Params = {
        ACL: 'public-read',
        Bucket: secrets.AWS_S3_BUCKET,
        Key: `${TARGET}/${version}/${fileName}`,
        ContentEncoding: 'gzip',
        Body: fileContent
    };

    await S3.upload(s3Params, function (err, data) {
        if (err) {
            console.log(`Error uploading ${fileName}: ${err}`);
        } if (data) {
            console.log(`[${fileName}] uploaded to ${version}`);
        }
    });
}

function publish () {
    checkSecrets();
    const version = verifiedPackageVersion();
    publishToCDN(version);
}

publish();
