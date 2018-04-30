/**
 * Purge our CDN fastly cache
 */

// Load secrets file

var fs = require('fs');

var secrets = JSON.parse(fs.readFileSync('secrets.json'));
if (!secrets || !secrets.FASTLY_API_KEY || !secrets.FASTLY_CARTODB_SERVICE) {
    throw Error('secrets.json content is not valid');
}

// Purge all cache

var fastly = require('fastly')(secrets.FASTLY_API_KEY);

fastly.purgeAll(secrets.FASTLY_CARTODB_SERVICE, function (err, obj) {
    if (err) return console.dir(err);
    console.dir(obj);
});
