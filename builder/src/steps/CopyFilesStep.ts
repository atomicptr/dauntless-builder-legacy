import fs from "fs";
import glob from "glob";
import path from "path";

import { RunConfig, Step } from "../Step";
import { WithStepLogger } from "../WithStepLogger";

export class CopyFilesStep extends WithStepLogger implements Step {
    canRun(_verbose: boolean): boolean {
        return true;
    }

    isAllowedToFail(): boolean {
        return false;
    }

    name(): string {
        return "copy";
    }

    async run(runConfig: RunConfig): Promise<void> {
        const publicI18nDir = path.join(runConfig.publicDir, "i18n");

        if (!fs.existsSync(publicI18nDir)) {
            fs.mkdirSync(publicI18nDir);
        }

        const i18nFiles = glob.sync(path.join(runConfig.targetDir, "i18n", "*", "items.*.json"));

        this.log("Copy i18n files to public directory:");

        for (const file of i18nFiles) {
            const newFilename = path.basename(file).slice("items.".length);
            const copyPath = path.join(publicI18nDir, newFilename);
            fs.copyFileSync(file, copyPath);

            this.log(`Copy file ${file} to ${copyPath}`);
        }

        this.log("Done!");
    }
}
