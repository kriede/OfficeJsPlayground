var webpack = require('webpack');
var helpers = require('./helpers');

var CopyWebpackPlugin = require('copy-webpack-plugin');
var ExtractTextPlugin = require('extract-text-webpack-plugin');
var autoprefixer = require('autoprefixer');
var perfectionist = require('perfectionist');

module.exports = {
    entry: {
        'polyfills': './src/polyfills.ts',
        'vendor': './src/vendor.ts',
        'app': './src/app.ts',
    },

    resolve: {
        alias: {
            'vs': helpers.node_modules('monaco-editor/min/vs')
        },
        extensions: ['', '.js', '.ts']
    },

    module: {
        loaders: [
            {
                test: /\.html$/,
                loader: 'html'
            },
            {
                test: /\.ts$/,
                loaders: ['ts', 'angular2-template-loader']
            },
            {
                test: /^(?!.*component).*\.scss$/,
                loader: ExtractTextPlugin.extract('css!postcss!sass')
            },
            {
                test: /\.component\.scss$/,
                loaders: ['raw', 'resolve-url', 'postcss', 'sass']
            },
            {
                test: /\.(png|jpe?g|gif|svg|woff|woff2|ttf|eot|ico)$/,
                loader: 'file?name=assets/[name].[ext]'
            }
        ]        
    },

    postcss: function () {
        return [autoprefixer({ browsers: ['Safari >= 8', 'last 2 versions'] }), perfectionist];
    },

    plugins: [
        new webpack.optimize.CommonsChunkPlugin({
            name: ['polyfills', 'vendor', 'app'].reverse()
        }),

        new CopyWebpackPlugin([
            {
                from: 'src/acquire.html',
                to: 'acquire.html'
            },
            {
                from: 'src/addin.html',
                to: 'addin.html'
            },
            {
                from: 'node_modules/monaco-editor/min/vs',
                to: 'vs',
            },
            {
                from: './src/assets',
                to: 'assets',
            },
            {
                from: './web.config',
                to: 'web.config',
            },
        ]),

        new webpack.ProvidePlugin({
            _: 'underscore',
            $: 'jquery',
            require: 'require'
        })
    ]
};