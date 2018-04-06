const path = require('path');
const webpack = require('webpack');
const banner = require('./banner');

module.exports = {
    entry: './src/index.js',
    output: {
        path: path.resolve(__dirname, '..', 'dist'),
        filename: 'cartovl.js',
        library: 'carto',
        libraryTarget: 'umd'
    },
    devtool: 'sourcemap',
    plugins: [
        new webpack.BannerPlugin(banner)
    ]
};
