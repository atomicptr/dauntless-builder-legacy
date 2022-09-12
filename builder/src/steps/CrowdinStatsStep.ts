import { ProjectsGroups, TranslationStatus } from "@crowdin/crowdin-api-client";
import fs from "fs";
import path from "path";
import sortJson from "sort-json";

import { crowdinProjectId } from "../constants";
import { RunConfig, Step } from "../Step";
import { WithStepLogger } from "../WithStepLogger";

export class CrowdinStatsStep extends WithStepLogger implements Step {
    canRun(_verbose: boolean): boolean {
        if (!process.env.CROWDIN_TOKEN) {
            this.error("Required environment variable CROWDIN_TOKEN is not set.");
            return false;
        }

        return true;
    }

    isAllowedToFail(): boolean {
        return true;
    }

    name(): string {
        return "crowdin-stats";
    }

    async run(runConfig: RunConfig): Promise<void> {
        if (!process.env.CROWDIN_TOKEN) {
            return;
        }

        const credentials = {
            token: process.env.CROWDIN_TOKEN,
        };

        const projectApi = new ProjectsGroups(credentials);
        const translationStatusApi = new TranslationStatus(credentials);

        const project = await projectApi.getProject(crowdinProjectId);

        const languages = project.data.targetLanguageIds;

        const progress: {
            [language: string]: number;
        } = {};

        for (const lang of languages) {
            this.log(`Checking translation status for ${lang}...`);

            const status = await translationStatusApi.getLanguageProgress(crowdinProjectId, lang);

            const total = status.data.map(s => s.data.words.total).reduce((prev, curr) => prev + curr, 0);
            const translated = status.data.map(s => s.data.words.translated).reduce((prev, curr) => prev + curr, 0);

            progress[lang.substring(0, 2)] = Math.round((translated / total) * 100);
        }

        const stats = { progress };

        const filePath = path.join(runConfig.targetDir, "crowdin-stats.json");

        fs.writeFileSync(filePath, JSON.stringify(stats));

        sortJson.overwrite(filePath);
    }
}
