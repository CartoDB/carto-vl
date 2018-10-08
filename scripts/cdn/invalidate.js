/**
 * Purge our CDN fastly cache
 */

const secrets = require('../../secrets.json');

if (!secrets ||
    !secrets.FASTLY_API_KEY ||
    !secrets.FASTLY_CARTODB_SERVICE) {
    throw Error('secrets.json content is not valid');
}

// Purge all cache

let fastly = require('fastly')(secrets.FASTLY_API_KEY);

console.log('Invalidating CDN cache');
fastly.purgeAll(secrets.FASTLY_CARTODB_SERVICE, function (err) {
    if (err) return console.error(err);
    console.log('Done');
});
