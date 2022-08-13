import path from "path";
import { fileURLToPath } from "url";

import { RunConfig, Step } from "./Step";
import { DataStep } from "./steps/DataStep";
import { I18nStep } from "./steps/I18nStep";

const Steps = [DataStep, I18nStep];

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
            log(name, `Skipping ${name} step due to unmet conditions, re-run with --verbose to find out more!`);
            continue;
        }

        log(name, `Running ${name} step...`);
        try {
            await step.run(runConfig);
        } catch (err) {
            log(name, "Error: ", err);
            process.exit(1);
        }
        log(name, `Finished ${name} step.`);
    }

    log("main", "Done.");
};

main();
