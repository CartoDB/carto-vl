/**
 * Purge our CDN fastly cache
 */

// Load secrets file

let fs = require('fs');

let secrets = JSON.parse(fs.readFileSync('secrets.json'));
if (!secrets ||
    !secrets.FASTLY_API_KEY ||
    !secrets.FASTLY_CARTODB_SERVICE) {
    throw Error('secrets.json content is not valid');
}

// Purge all cache

let fastly = require('fastly')(secrets.FASTLY_API_KEY);

console.log('Invalidate CDN');
fastly.purgeAll(secrets.FASTLY_CARTODB_SERVICE, function (err) {
    if (err) return console.error(err);
    console.log('Done');
});
