// Script to build JSON files for the about page
//
// This is a script we allow use of console here
/* eslint-disable no-console */

import axios from "axios";
import { spawn } from "child_process";
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";

import { Contributor } from "../src/pages/about/About";

// list of excluded contributors, use their Github name e.g. "ds902022"
const excludeContributors: string[] = [];

// list of excluded dependencies, use the full package name (without version!) e.g. "@babel/core"
const excludeDependencies: string[] = [];

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const targetDir = path.join(__dirname, "..", "src", "pages", "about");

const fetchContributors = async (): Promise<Contributor[]> => {
    const res = await axios.get<Contributor[]>("https://api.github.com/repos/atomicptr/dauntless-builder/contributors");

    if (res.status !== 200) {
        console.error("Request to Github API failed: ", res.data);
        throw Error(`Request to Github API failed: ${res.status} ${res.statusText}`);
    }

    return res.data;
};

const buildContributorsFile = async (filepath: string): Promise<void> => {
    const contributors = await fetchContributors();

    return new Promise(resolve => {
        const filtered = contributors
            .map(({ login, avatar_url, html_url, type, contributions }) => ({
                avatar_url,
                contributions,
                html_url,
                login,
                type,
            }))
            .sort((a, b) => b.contributions - a.contributions)
            .filter(contributor => contributor.type !== "Bot")
            .filter(contributor => excludeContributors.indexOf(contributor.login) === -1);

        fs.writeFile(filepath, JSON.stringify(filtered, null, "    "), () => {
            resolve();
        });
    });
};

const buildDependenciesFile = async (filepath: string): Promise<void> => {
    return new Promise(resolve => {
        const child = spawn("npx", ["license-checker", "--production", "--json"]);

        let data = "";

        child.stdout?.on("data", (chunk: string) => {
            data += chunk.toString();
        });

        child.stdout?.on("close", () => {
            const json = JSON.parse(data);

            const filtered = Object.keys(json)
                .map(name => ({
                    license: json[name].licenses,
                    name,
                    repository: json[name].repository,
                }))
                .sort((a, b) => a.name.localeCompare(b.name))
                .filter(
                    dependency =>
                        excludeDependencies.findIndex(excluded => dependency.name.startsWith(excluded)) === -1,
                );

            fs.writeFile(filepath, JSON.stringify(filtered, null, "    "), () => {
                resolve();
            });
        });
    });
};

const main = async () => {
    console.log("[build:about] Building @src/pages/about/contributors.json");
    await buildContributorsFile(path.join(targetDir, "contributors.json"));

    console.log("[build:about] Building @src/pages/about/dependencies.json");
    await buildDependenciesFile(path.join(targetDir, "dependencies.json"));

    console.log("[build:about] Done.");
};

main().catch(err => {
    console.error(err);
    process.exit(1);
});
