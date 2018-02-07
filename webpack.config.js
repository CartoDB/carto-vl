/*eslint-env node*/
const path = require('path');
const webpack = require('webpack');
const VERSION = require('./package.json').version;
const banner = `CARTOGL-${VERSION}`;

module.exports = {
    entry: './src/index.js',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'cartogl.js',
        library: 'carto',
        libraryTarget: 'umd'
    },
    devtool: 'sourcemap',
    plugins: [
        new webpack.BannerPlugin(banner)
    ]
};