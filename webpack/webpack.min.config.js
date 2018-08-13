const path = require('path');
const webpack = require('webpack');
const banner = require('./banner');

module.exports = {
    entry: './src/index.js',
    output: {
        path: path.resolve(__dirname, '..', 'dist'),
        filename: 'carto-vl.min.js',
        library: 'carto',
        libraryTarget: 'umd'
    },
    devtool: false,
    mode: 'production',
    module: {
        rules: [
            { test: /\.glsl$/, use: 'webpack-glsl-loader' },
            { test: /\.svg$/, use: 'svg-inline-loader' }
        ]
    },
    plugins: [
        new webpack.BannerPlugin(banner)
    ],
    performance: {
        maxEntrypointSize: 266240,
        maxAssetSize: 266240
    }
};
