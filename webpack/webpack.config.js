const path = require('path');
const webpack = require('webpack');
const banner = require('./banner');

module.exports = {
    entry: './src/index.js',
    output: {
        path: path.resolve(__dirname, '..', 'dist'),
        filename: 'carto-vl.js',
        library: 'carto',
        libraryTarget: 'umd'
    },
    devtool: 'sourcemap',
    mode: 'development',
    plugins: [
        new webpack.BannerPlugin(banner)
    ],
    module: {
        rules: [{ test: /\.glsl$/, use: 'shader-loader' }]
    }
};
