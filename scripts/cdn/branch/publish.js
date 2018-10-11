/**
 * Publish packages to our CDN
 */

const secrets = require('../../../secrets.json');

if (!secrets ||
    !secrets.AWS_USER_S3_KEY ||
    !secrets.AWS_USER_S3_SECRET ||
    !secrets.AWS_S3_BUCKET) {
    throw Error('secrets.json content is not valid');
}

const currentGitBranch = require('current-git-branch');
const s3 = require('s3');
const branch = currentGitBranch();
const client = s3.createClient({
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
        s3Params: {
            ACL: 'public-read',
            Bucket: secrets.AWS_S3_BUCKET,
            Prefix: 'carto-vl/branches/' + branch + '/'
        }
    });

    uploader.on('error', function (err) {
        console.error('Error: unable to upload:', err.stack);
    });

    uploader.on('progress', function () {
        const progress = uploader.progressTotal !== 0
            ? ((uploader.progressAmount / uploader.progressTotal) * 100).toFixed(2)
            : 0;

        console.log('Uploading...', `${progress}%`);
    });

    uploader.on('end', function () {
        console.log('Done!', branch);
    });
}
