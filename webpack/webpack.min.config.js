const path = require('path');
const webpack = require('webpack');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const banner = require('./banner');

module.exports = {
    entry: './src/index.js',
    output: {
        path: path.resolve(__dirname, '..', 'dist'),
        filename: 'cartovl.min.js',
        library: 'carto',
        libraryTarget: 'umd'
    },
    devtool: 'sourcemap',
    plugins: [
        new UglifyJsPlugin(),
        new webpack.BannerPlugin(banner)
    ]
};
