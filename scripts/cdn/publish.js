/**
 * Publish packages to our CDN
 */

// Load secrets file

var fs = require('fs');

var secrets = JSON.parse(fs.readFileSync('secrets.json'));
if (!secrets ||
    !secrets.AWS_USER_S3_KEY ||
    !secrets.AWS_USER_S3_SECRET ||
    !secrets.AWS_S3_BUCKET) {
    throw Error('secrets.json content is not valid');
}

// Load package version

var semver = require('semver');

var version = JSON.parse(fs.readFileSync('package.json')).version;
if (!version || !semver.valid(version)) {
    throw Error('package.json version is not valid');
}

// Publish to CDN
// E.g.
//   v1.2.3: v1 / v1.2 / v1.2.3
//   v1.2.3-beta.4: v1.2.3-beta / v1.2.3-beta.4

var s3 = require('s3');

var client = s3.createClient({
    s3Options: {
        accessKeyId: secrets.AWS_USER_S3_KEY,
        secretAccessKey: secrets.AWS_USER_S3_SECRET
    }
});

var major = semver.major(version);
var minor = semver.minor(version);
var patch = semver.patch(version);
var prerelease = semver.prerelease(version);

if (prerelease) {
    /**
    * Publish prerelease URLs
    */
    var base = 'v' + major + '.' + minor + '.' + patch + '-';
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

function uploadFiles(version) {
    console.log('Publish', version);
    var uploader = client.uploadDir({
        localDir: 'dist',
        s3Params: {
            Bucket: secrets.AWS_S3_BUCKET,
            Prefix: 'carto-vl/' + version + '/'
        }
    });
    uploader.on('error', function(err) {
        console.error('Error: unable to upload:', err.stack);
    });
    uploader.on('progress', function() {
    });
    uploader.on('end', function() {
        console.log('Done', version);
    });
}
