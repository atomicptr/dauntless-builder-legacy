import { Users } from "@crowdin/crowdin-api-client";
import fs from "fs";
import path from "path";
import sortJson from "sort-json";

import { crowdinProjectId, sortJsonOptions } from "../constants";
import { RunConfig, Step } from "../Step";
import { WithStepLogger } from "../WithStepLogger";

// list of excluded translators, use their Crowdin username e.g. "ds-exe"
const excludedTranslators: string[] = [];

export class CrowdinTranslatorsStep extends WithStepLogger implements Step {
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
        return "crowdin-translators";
    }

    async run(runConfig: RunConfig): Promise<void> {
        if (!process.env.CROWDIN_TOKEN) {
            return;
        }

        const credentials = {
            token: process.env.CROWDIN_TOKEN,
        };

        const usersApi = new Users(credentials);

        const users = await usersApi.listProjectMembers(crowdinProjectId);

        // TODO: figure out how to filter & sort by contributions
        const json = users.data
            .map(({ data }) => ({
                avatarUrl: "avatarUrl" in data ? data.avatarUrl : null,
                proofreader:
                    data.permissions === undefined ||
                    Object.values(data.permissions).some(role => role === "proofreader"),
                username: data.username,
            }))
            .filter(user => excludedTranslators.indexOf(user.username) === -1);

        const filePath = path.join(runConfig.targetDir, "translators.json");

        fs.writeFileSync(filePath, JSON.stringify(json));
        sortJson.overwrite(filePath, sortJsonOptions);
    }
}
