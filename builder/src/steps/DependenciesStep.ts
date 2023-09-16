import { spawn } from "child_process";
import fs from "fs";
import path from "path";

import { RunConfig, Step } from "../Step";
import { WithStepLogger } from "../WithStepLogger";

// list of excluded dependencies, use the full package name (without version!) e.g. "@babel/core"
const excludeDependencies: string[] = ["dauntless-builder"];

export class DependenciesStep extends WithStepLogger implements Step {
    canRun(_verbose: boolean): boolean {
        return true;
    }

    isAllowedToFail(): boolean {
        return false;
    }

    name(): string {
        return "dependencies";
    }

    async run(runConfig: RunConfig): Promise<void> {
        const filepath = path.join(runConfig.targetDir, "dependencies.json");

        return new Promise(resolve => {
            const child = spawn("bun", ["x", "license-checker", "--production", "--json"], { shell: true });

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
    }
}
