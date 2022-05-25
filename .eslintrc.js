module.exports = {
    root: true,
    parser: "@typescript-eslint/parser",
    settings: {
        react: {
            version: "detect",
        },
    },
    extends: [
        "eslint:recommended",
        "plugin:react/recommended",
        "plugin:react/jsx-runtime",
        "plugin:@typescript-eslint/recommended",
    ],
    plugins: ["react", "@typescript-eslint"],
    rules: {
        indent: ["error", 4, { SwitchCase: 1 }],
        "linebreak-style": 0,
        quotes: ["error", "double"],
        semi: ["error", "always"],
        "no-console": 0,
        curly: "error",
        strict: ["error", "global"],
        "react/jsx-tag-spacing": ["error", { beforeSelfClosing: "always" }],
    },
};
