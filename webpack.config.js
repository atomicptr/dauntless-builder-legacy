const path = require("path");

module.exports = {
    entry: {
        "dauntless-builder": "./src/App.jsx",
    },
    output: {
        path: path.join(__dirname, "dist"),
        libraryTarget: "umd",
        filename: "[name].js"
    },
    module: {
        rules: [
            {
                test: /\.jsx?$/,
                exclude: /node_modules/,
                loader: "babel-loader",
                query: {
                    presets: ["react"]
                }
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
   optimization: {
        splitChunks: {
            chunks: "all",
            automaticNameDelimiter: "-"
        }
    },
    resolve: {
        modules: [
            path.join(__dirname, "src"),
            path.join(__dirname, "data"),
            "node_modules"
        ],
        extensions: [".js", ".jsx"]
    }
}
