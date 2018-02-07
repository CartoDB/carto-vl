const path = require('path');

module.exports = {
    devtool: 'source-map',
    entry: {
        mapbox: './examples/complete/mapbox.js',
    },
    output: {
        path: path.join(__dirname, 'dist'),
        filename: '[name].js'
    }
};
