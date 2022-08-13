import path from "path";
import { fileURLToPath } from "url";

import { RunConfig, Step } from "./Step";
import { DataStep } from "./steps/DataStep";

const Steps = [DataStep];

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.join(__dirname, "..", "..");

const runConfig: RunConfig = {
    dataDir: path.join(rootDir, "data"),
    publicDir: path.join(rootDir, "public"),
    rootDir,
    targetDir: path.join(rootDir, "src", "json"),
};

const log = (name: string, ...args: unknown[]) => {
    /* eslint-disable-next-line no-console */
    console.log(`[build:${name}]`, ...args);
};

const main = async () => {
    log("debug", runConfig);

    for (const StepClass of Steps) {
        const step: Step = new StepClass();

        const name = step.name();

        // TODO: skip by name via CLI

        if (!step.canRun()) {
            log(name, "Skipping...");
            continue;
        }

        log(name, "Running...");
        await step.run(runConfig);
        log(name, "Done.");
    }

    log("main", "Done.");
};

main();
