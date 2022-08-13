import path from "path";
import { fileURLToPath } from "url";

import { RunConfig, Step } from "./Step";
import { DataStep } from "./steps/DataStep";
import { I18nStep } from "./steps/I18nStep";
import commandLineArgs from "command-line-args";

const Steps = [DataStep, I18nStep];

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.join(__dirname, "..", "..");

interface CommandLineOptions {
    verbose: boolean;
    exclude: string[];
    run: string[];
}

const defaultValues: CommandLineOptions = {
    verbose: false,
    exclude: [],
    run: [],
};

const options = Object.assign(
    defaultValues,
    commandLineArgs([
        { name: "verbose", alias: "v", type: Boolean },
        { name: "exclude", type: String, multiple: true },
        { name: "run", type: String, multiple: true },
    ]),
) as CommandLineOptions;

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

const debug = (...args: unknown[]) => {
    if (!options.verbose) {
        return;
    }
    log("debug", ...args);
};

const main = async () => {
    debug("Run configuration", runConfig);
    debug("Console arguments", options);

    for (const StepClass of Steps) {
        const step: Step = new StepClass();

        const name = step.name();

        if (options.run.length > 0 && options.run.indexOf(name) === -1) {
            debug(`Skipping ${name} step, because it wasn't whitelisted.`);
            continue;
        }

        if (options.exclude.indexOf(name) > -1) {
            debug(`Skipping ${name} step, because it was excluded.`);
            continue;
        }

        if (!step.canRun(options.verbose)) {
            log(name, `Skipping ${name} step due to unmet conditions, re-run with --verbose to find out more!`);
            continue;
        }

        log(name, `Running ${name} step...`);
        try {
            await step.run(runConfig);
        } catch (err) {
            log(name, "Error: ", err);

            if (!step.isAllowedToFail()) {
                process.exit(1);
            }

            log(name, `Step ${name} is allowed to fail, continue...`);
        }
        log(name, `Finished ${name} step.`);
    }

    log("main", "Done.");
};

main();
