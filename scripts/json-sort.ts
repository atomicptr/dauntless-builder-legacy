// Script to sort/lint json files
// This is a script we allow use of console here
/* eslint-disable no-console */
import fs from "fs";
import glob from "glob";
import path from "path";
import sortJson from "sort-json";
import { fileURLToPath } from "url";

import { sortJsonOptions } from "../builder/src/constants";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const lintMode = process.argv.find(arg => arg === "--fix") === undefined;

const filePatterns = [".eslintrc", "**/tsconfig.json", "src/translations/**.json", "data/_schemas/**.json"].map(
    pattern => path.join(__dirname, "..", pattern),
);

const files = filePatterns
    .map(pattern => glob.sync(pattern))
    .flat(10)
    .filter(pattern => pattern.indexOf("node_modules") === -1);

if (lintMode) {
    let failed = false;

    files.forEach(file => {
        const content = fs.readFileSync(file).toString();
        sortJson.overwrite(file, sortJsonOptions);
        const contentAfter = fs.readFileSync(file).toString();

        if (content !== contentAfter) {
            console.error(`- File: ${file} is not formatted correctly, run yarn lint:fix`);
            failed = true;
        } else {
            console.log(`+ File: ${file}`);
        }
    });

    process.exit(failed ? 1 : 0);
}

sortJson.overwrite(files, sortJsonOptions);
