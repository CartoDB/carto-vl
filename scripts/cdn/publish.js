/**
 * Publish packages to our CDN
 */

// Load secrets file

let fs = require('fs');

let secrets = JSON.parse(fs.readFileSync('secrets.json'));
if (!secrets ||
    !secrets.AWS_USER_S3_KEY ||
    !secrets.AWS_USER_S3_SECRET ||
    !secrets.AWS_S3_BUCKET) {
    throw Error('secrets.json content is not valid');
}

// Load package version

let semver = require('semver');

let version = JSON.parse(fs.readFileSync('package.json')).version;
if (!version || !semver.valid(version)) {
    throw Error('package.json version is not valid');
}

// Publish to CDN
// E.g.
//   v1.2.3: v1 / v1.2 / v1.2.3
//   v1.2.3-beta.4: v1.2.3-beta / v1.2.3-beta.4

let s3 = require('s3');

let client = s3.createClient({
    s3Options: {
        accessKeyId: secrets.AWS_USER_S3_KEY,
        secretAccessKey: secrets.AWS_USER_S3_SECRET
    }
});

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
        upload(base + prerelease[0]);
    }
    if (prerelease[1]) { // number
        upload(base + prerelease[0] + '.' + prerelease[1]);
    }
} else {
    /**
    * Publish release URLs
    */
    upload('v' + major);
    upload('v' + major + '.' + minor);
    upload('v' + major + '.' + minor + '.' + patch);
}

function upload (version) {
    console.log('Publish', version);
    uploadFiles('dist', 'carto-vl/' + version + '/');
    console.log('Publish assets');
    uploadFiles('assets', 'carto-vl/assets/');
}

function uploadFiles (orig, dest) {
    let uploader = client.uploadDir({
        localDir: orig,
        deleteRemoved: true,
        s3Params: {
            ACL: 'public-read',
            Bucket: secrets.AWS_S3_BUCKET,
            Prefix: dest
        }
    });
    uploader.on('error', function (err) {
        console.error('Error: unable to upload:', err.stack);
    });
    uploader.on('progress', function () {
    });
    uploader.on('end', function () {
        console.log('Done');
    });
}
