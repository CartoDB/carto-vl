const path = require('path');
const webpack = require('webpack');
const banner = require('./banner');

module.exports = {
    entry: {
        'carto-vl': './src/index.js'
    },
    output: {
        path: path.resolve(__dirname, '..', 'dist'),
        filename: '[name].js',
        library: 'carto',
        libraryTarget: 'umd'
    },
    devtool: 'source-map',
    mode: 'development',
    module: {
        rules: [
            { test: /\.glsl$/, use: 'webpack-glsl-loader' },
            { test: /\.svg$/, use: 'svg-inline-loader' },
            {
                test: /\.worker\.js$/,
                use: {
                    loader: 'worker-loader',
                    options: {
                        publicPath: '/dist/',
                        name: 'carto-vl-[hash].worker.js',
                        inline: true
                    }
                }
            }
        ]
    },
    plugins: [
        new webpack.BannerPlugin(banner)

    ]
};
