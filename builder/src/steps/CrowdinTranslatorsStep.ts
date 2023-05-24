import { Credentials, ProjectsGroups, StringTranslations, Users } from "@crowdin/crowdin-api-client";
import fs from "fs";
import path from "path";
import sortJson from "sort-json";

import { crowdinProjectId, sortJsonOptions } from "../constants";
import { RunConfig, Step } from "../Step";
import { WithStepLogger } from "../WithStepLogger";

// list of excluded translators, use their Crowdin username e.g. "ds-exe"
const excludedTranslators: string[] = [];

interface UserContributionsMap {
    [username: string]: number;
}

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

        const projectGroupsApi = new ProjectsGroups(credentials);
        const usersApi = new Users(credentials);

        const project = await projectGroupsApi.getProject(crowdinProjectId);

        const userContributions: UserContributionsMap = {};

        for (const languageId of project.data.targetLanguageIds) {
            const map = await this.fetchUserContributions(credentials, languageId);

            for (const username in map) {
                if (!(username in userContributions)) {
                    userContributions[username] = 0;
                }
                userContributions[username] += map[username];
            }
        }

        const users = await usersApi.listProjectMembers(crowdinProjectId);

        const json = users.data
            .map(({ data }) => ({
                avatarUrl: "avatarUrl" in data ? data.avatarUrl : null,
                contributions: userContributions[data.username],
                proofreader:
                    data.permissions === undefined ||
                    Object.values(data.permissions).some(role => role === "proofreader"),
                username: data.username,
            }))
            .filter(user => excludedTranslators.indexOf(user.username) === -1)
            .filter(user => user.contributions > 0)
            .sort((a, b) => b.contributions - a.contributions);

        const filePath = path.join(runConfig.targetDir, "translators.json");

        fs.writeFileSync(filePath, JSON.stringify(json));
        sortJson.overwrite(filePath, sortJsonOptions);
    }

    private async fetchUserContributions(credentials: Credentials, languageId: string): Promise<UserContributionsMap> {
        let page = 0;
        const limit = 500;
        let running = true;

        const stringTranslationsApi = new StringTranslations(credentials);

        const contributions: UserContributionsMap = {};

        this.log(`Determining user contributions for language ${languageId}...`);

        while (running) {
            const translations = await stringTranslationsApi.listLanguageTranslations(crowdinProjectId, languageId, {
                limit,
                offset: page * limit,
            });

            for (const translation of translations.data) {
                if (!("user" in translation.data)) {
                    continue;
                }

                const username = translation.data.user.username;
                if (!(username in contributions)) {
                    contributions[username] = 0;
                }
                contributions[username] += 1;
            }

            if (translations.data.length < limit) {
                running = false;
            }

            page++;
        }

        return contributions;
    }
}
