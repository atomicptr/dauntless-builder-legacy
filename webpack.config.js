const path = require("path");
const HtmlWebPackPlugin = require('html-webpack-plugin');

module.exports = {
    mode: process.argv.indexOf("--production") > -1 ? "production" : "development",
    devtool: 'source-map',
    output: {
        libraryTarget: "umd",
        filename: "dauntless-builder.js"
    },
    module: {
        rules: [
            {
                test: /\.jsx?$/,
                exclude: /node_modules/,
                use: [
                    'babel-loader',
                ],
            },
            {
                test: /\.s?css$/,
                use: [
                    "style-loader",
                    "css-loader",
                    "sass-loader"
                ]
            }
        ],
    },
    resolve: {
        modules: [
            path.join(__dirname, "src"),
            path.join(__dirname, "data"),
            "node_modules"
        ],
        extensions: [".js", ".jsx"]
    },
    plugins: [new HtmlWebPackPlugin({
        template: './src/index.html',
    })],
}
