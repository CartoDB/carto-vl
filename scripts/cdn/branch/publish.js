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

const branchName = require('current-git-branch');
const branch = JSON.parse(fs.readFileSync('package.json')).branch || branchName();

let s3 = require('s3');
let client = s3.createClient({
    s3Options: {
        accessKeyId: secrets.AWS_USER_S3_KEY,
        secretAccessKey: secrets.AWS_USER_S3_SECRET
    }
});

uploadFiles(branch);

function uploadFiles (branch) {
    console.log('Publishing branch:', branch);

    let uploader = client.uploadDir({
        localDir: 'dist',
        deleteRemoved: true,
        s3Params: {
            ACL: 'public-read',
            Bucket: secrets.AWS_S3_BUCKET,
            Prefix: 'carto-vl/' + branch + '/'
        }
    });

    uploader.on('error', function (err) {
        console.error('Error: unable to upload:', err.stack);
    });

    uploader.on('progress', function () {
        console.log('Uploading...', `${uploader.progressAmount / uploader.progressTotal}%`);
    });

    uploader.on('end', function () {
        console.log('Done!', branch);
    });
}
