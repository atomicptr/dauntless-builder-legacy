import * as fs from "fs";
import glob from "glob";
import yaml from "js-yaml";
import md5 from "md5";
import path from "path";
import sortJson from "sort-json";

import { sortJsonOptions } from "../constants";
import { RunConfig, Step } from "../Step";
import { WithStepLogger } from "../WithStepLogger";

interface StringMap {
    [category: string]: {
        [id: string]: string;
    };
}

interface StringCounter {
    [category: string]: number;
}

export class DataStep extends WithStepLogger implements Step {
    private stringMap: StringMap = {};
    private stringCounter: StringCounter = {};

    name(): string {
        return "data";
    }

    canRun(_verbose: boolean): boolean {
        return true;
    }

    isAllowedToFail(): boolean {
        return false;
    }

    async run(runConfig: RunConfig): Promise<void> {
        const namesJsonPath = path.join(runConfig.targetDir, "names.json");

        if (fs.existsSync(namesJsonPath)) {
            this.stringMap = this.readJson(namesJsonPath);
        }

        const [armours, cells, lanterns, perks, weapons, parts, omnicells, misc] = await Promise.all([
            this.buildMap(path.join(runConfig.dataDir, "armours", "*", "*.yml")),
            this.buildMap(path.join(runConfig.dataDir, "cells", "*", "*.yml")),
            this.buildMap(path.join(runConfig.dataDir, "lanterns", "*.yml")),
            this.buildMap(path.join(runConfig.dataDir, "perks", "*.yml")),
            this.buildMap(path.join(runConfig.dataDir, "weapons", "*", "*.yml")),
            this.buildMap(path.join(runConfig.dataDir, "parts", "*", "*", "*.yml")),
            this.buildMap(path.join(runConfig.dataDir, "omnicells", "*.yml")),
            this.buildMap(path.join(runConfig.dataDir, "misc.yml")),
        ]);

        const object = {
            armours,
            cells,
            lanterns,
            misc,
            omnicells,
            parts,
            perks,
            weapons,
        };

        if (!fs.existsSync(runConfig.publicDir)) {
            fs.mkdirSync(runConfig.publicDir);
        }

        const dataString = JSON.stringify(object);
        fs.writeFileSync(path.join(runConfig.publicDir, "data.json"), dataString);
        fs.writeFileSync(path.join(runConfig.targetDir, "data.json"), JSON.stringify(object, null, "    ") + "\n");

        this.log("Build data.json");

        this.stringMap = this.sortByKey(this.stringMap);

        // store a nicer version in the repository
        fs.writeFileSync(
            path.join(runConfig.targetDir, "names.json"),
            JSON.stringify(this.stringMap, null, "    ") + "\n",
        );

        const mapDir = path.join(runConfig.publicDir, "map");

        if (!fs.existsSync(mapDir)) {
            fs.mkdirSync(mapDir);
        }

        const mapString = JSON.stringify(this.stringMap);
        fs.writeFileSync(path.join(mapDir, "names.json"), mapString);

        fs.writeFileSync(
            path.join(runConfig.publicDir, "meta.json"),
            JSON.stringify({
                build_time: new Date().getTime(),
                data_hash: md5(dataString),
                map_hash: md5(mapString),
            }),
        );

        const num = Object.keys(this.stringMap)
            .map(key => Object.keys(this.stringMap[key]).length)
            .reduce((a, b) => a + b);

        this.log("Build string map with " + num + " entries.");

        sortJson.overwrite(
            [
                path.join(runConfig.publicDir, "data.json"),
                path.join(runConfig.targetDir, "data.json"),
                path.join(runConfig.targetDir, "names.json"),
                path.join(mapDir, "names.json"),
                path.join(runConfig.publicDir, "meta.json"),
            ],
            sortJsonOptions,
        );
    }

    private readJson(path: string) {
        const data = fs.readFileSync(path);
        return JSON.parse(data.toString());
    }

    private tryInsertToStringMap(category: string, string: string) {
        if (!this.stringMap[category]) {
            this.stringMap[category] = {};
        }

        if (!this.stringCounter[category]) {
            this.stringCounter[category] = 1;
        }

        const strings = Object.values(this.stringMap[category]);

        if (strings.indexOf(string) > -1) {
            return;
        }

        let running = true;

        while (running) {
            if (Object.keys(this.stringMap[category]).indexOf(`${this.stringCounter[category]}`) === -1) {
                this.stringMap[category][this.stringCounter[category]] = string;
                this.log(`Added ${string} to ${category} at ${this.stringCounter[category]}`);
                running = false;
                continue;
            }

            this.stringCounter[category]++;
        }
    }

    private buildMap(filesGlob: string) {
        return new Promise((resolve, _reject) => {
            glob(filesGlob, { windowsPathsNoEscape: true }, (err, files) => {
                let data = {} as {
                    [name: string]: unknown;
                };

                for (const file of files) {
                    const content = fs.readFileSync(file, "utf8");
                    const doc = yaml.load(content) as {
                        name: string;
                        variants: unknown[];
                        [field: string]: unknown;
                    };

                    // it is a cell use variant names instead of name
                    if (file.indexOf("/cells/") > -1) {
                        data[doc.name] = doc;

                        for (const v of Object.keys(doc.variants)) {
                            this.tryInsertToStringMap("Cells", v);
                        }
                    } else if (file.indexOf("/parts/") > -1) {
                        type Part = {
                            [weaponType: string]: {
                                [partType: string]: {
                                    [field: string]: unknown;
                                };
                            };
                        };

                        const parts = file.split("/");
                        const partsFolderIndex = parts.indexOf("parts");

                        const [weaponType, partType] = parts.slice(partsFolderIndex + 1) as [string, string];

                        if (!(data as Part)[weaponType]) {
                            (data as Part)[weaponType] = {};
                        }

                        if (!(data as Part)[weaponType][partType]) {
                            (data as Part)[weaponType][partType] = {};
                        }

                        (data as Part)[weaponType][partType][doc.name] = doc;
                        this.tryInsertToStringMap(`Parts:${this.ucfirst(weaponType)}`, doc.name);
                    } else if (file.indexOf("misc.yml") > -1) {
                        // don't use string maps on misc
                        data = doc;
                    } else {
                        data[doc.name] = doc;
                        let type = doc.type as string;

                        if (file.indexOf("/perks/") > 0) {
                            type = "Perks";
                        } else if (file.indexOf("/lanterns/") > 0) {
                            type = "Lanterns";
                        } else if (file.indexOf("/weapons/") > 0) {
                            type = "Weapons";
                        } else if (file.indexOf("/armours/") > 0) {
                            type = "Armours";
                        } else if (file.indexOf("/omnicells/") > 0) {
                            type = "Omnicells";
                        }

                        this.tryInsertToStringMap(type, doc.name);
                    }
                }

                resolve(data);
            });
        });
    }

    private ucfirst(string: string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }

    private sortByKey<T extends object>(object: T): T {
        const newObject = <T>{};

        const sortedKeys = Object.keys(object).sort();

        for (const key of sortedKeys) {
            let value = object[key as keyof T];

            if (typeof value === "object" && Object.keys(value as object).length > 0) {
                value = this.sortByKey(value as object) as T[keyof T];
            }

            newObject[key as keyof T] = value;
        }

        return newObject;
    }
}
