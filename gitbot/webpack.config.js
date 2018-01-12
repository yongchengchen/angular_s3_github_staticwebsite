var webpack = require('webpack');
var path = require('path');
var fs = require('fs');

var nodeModules = {};
fs.readdirSync('node_modules')
    .filter(function(x) {
        return ['.bin'].indexOf(x) === -1;
    })
    .forEach(function(mod) {
        nodeModules[mod] = 'commonjs ' + mod;
    });

module.exports = {
    target: 'node',
    node: {
        console: false,
        global: false,
        process: false,
        Buffer: false,
        __filename: true,
        __dirname: true
    },

    entry: './tmp/main.js',

    output: {
        path: path.join(__dirname, "dist"),
        library: "index",
        libraryTarget: "commonjs2",
        filename: 'index.js'
    },

    externals: nodeModules,
    plugins: [
        new webpack.IgnorePlugin(/\.(css|less)$/),
        //new webpack.BannerPlugin({banner: 'require("source-map-support").install();', raw: true, entryOnly: false})
    ],
    //devtool: 'sourcemap',

    module: {
        loaders: [
            { test: /\.json$/, loader: "json-loader" }
        ]
    },

    /*plugins: [
        new webpack.optimize.UglifyJsPlugin({
            compress: {
                warnings: false
            },
            mangle: true
        })
    ]*/
}