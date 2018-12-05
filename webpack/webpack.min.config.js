const path = require('path');
const webpack = require('webpack');
const banner = require('./banner');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');

module.exports = {
    entry: {
        'carto-vl.min': './src/index.js'
    },
    output: {
        path: path.resolve(__dirname, '..', 'dist'),
        filename: '[name].js',
        library: 'carto',
        libraryTarget: 'umd'
    },
    devtool: false,
    mode: 'production',
    optimization: {
        minimizer: [new UglifyJsPlugin({
            uglifyOptions: {
                keep_fnames: true
            }
        })]
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: [
                            '@babel/preset-env'
                        ]
                    }
                }
            },
            { test: /\.glsl$/, use: 'webpack-glsl-loader' },
            { test: /\.svg$/, use: 'svg-inline-loader' },
            {
                test: /\.worker\.js$/,
                use: {
                    loader: 'worker-loader',
                    options: {
                        publicPath: '/dist/',
                        name: 'carto-vl-[hash].worker.min.js',
                        inline: true
                    }
                }
            }
        ]
    },
    plugins: [
        new webpack.BannerPlugin(banner)
    ],
    performance: {
        maxEntrypointSize: 435200,
        maxAssetSize: 435200
    }
};
