const path = require('path');
const webpack = require('webpack');
const banner = require('./banner');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');

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
    optimization: {
        minimizer: [
            new UglifyJSPlugin({
                uglifyOptions: {
                    output: {
                        comments: false
                    },
                    compress: {
                        properties: true,
                        keep_fargs: false,
                        pure_getters: true,
                        collapse_vars: true,
                        warnings: false,
                        sequences: true,
                        dead_code: true,
                        drop_debugger: true,
                        comparisons: true,
                        conditionals: true,
                        evaluate: true,
                        booleans: true,
                        loops: true,
                        unused: true,
                        hoist_funs: true,
                        if_return: true,
                        join_vars: true,
                        drop_console: true
                    }
                }
            })
        ]
    },
    plugins: [
        new webpack.BannerPlugin(banner)
    ]
};
