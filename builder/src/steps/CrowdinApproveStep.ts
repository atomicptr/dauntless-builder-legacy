import { ProjectsGroups, SourceStrings, StringTranslations } from "@crowdin/crowdin-api-client";
import Queue from "queue-promise";

import { crowdinProjectId } from "../constants";
import { RunConfig, Step } from "../Step";
import { WithStepLogger } from "../WithStepLogger";

export class CrowdinApproveStep extends WithStepLogger implements Step {
    canRun(_verbose: boolean): boolean {
        if (!process.env.CROWDIN_TOKEN) {
            this.error("Required environment variable CROWDIN_TOKEN is not set.");
            return false;
        }

        if (!process.env.CROWDIN_APPROVE_REFERENCES) {
            this.error("Required environment variable CROWDIN_APPROVE_REFERENCES is not set.");
            return false;
        }

        return true;
    }

    isAllowedToFail(): boolean {
        return false;
    }

    name(): string {
        return "crowdin-approve";
    }

    async run(_runConfig: RunConfig): Promise<void> {
        if (!process.env.CROWDIN_TOKEN) {
            return;
        }

        const credentials = {
            token: process.env.CROWDIN_TOKEN,
        };

        const projectGroupsApi = new ProjectsGroups(credentials);
        const sourceStringsApi = new SourceStrings(credentials);
        const stringTranslationsApi = new StringTranslations(credentials);

        const project = await projectGroupsApi.getProject(crowdinProjectId);

        let page = 0;
        const limit = 500;
        let running = true;

        const queue = new Queue({
            concurrent: 50,
            interval: 100,
            start: false,
        });

        while (running) {
            // this can probably be optimized with CroQL
            const stringsRes = await sourceStringsApi.listProjectStrings(crowdinProjectId, {
                filter: "$t(",
                limit,
                offset: page * limit,
            });

            this.log(`working on page ${page}, found ${stringsRes.data.length} items...`);

            const strings = stringsRes.data
                .map(res => ({ id: res.data.id, text: res.data.text.toString() }))
                .filter(({ text }) => /^\$t\(.+\)$/gm.exec(text) !== null);

            const addTranslation = async (id: number, text: string, languageId: string) => {
                const translations = await stringTranslationsApi.listStringTranslations(
                    crowdinProjectId,
                    id,
                    languageId,
                );

                // if it has already a translation ignore
                if (translations.data.length > 0) {
                    return;
                }

                this.log(`Adding translation for ${languageId}: ${text}`);

                // add translation
                const translationRes = await stringTranslationsApi.addTranslation(crowdinProjectId, {
                    languageId,
                    stringId: id,
                    text: text,
                });

                this.log(`Approve translation for ${languageId}: ${translationRes.data.text}`);

                // approve translation
                await stringTranslationsApi.addApproval(crowdinProjectId, {
                    translationId: translationRes.data.id,
                });
            };

            for (const languageId of project.data.targetLanguageIds) {
                for (const string of strings) {
                    queue.enqueue(() => addTranslation(string.id, string.text, languageId));
                }
            }

            while (queue.shouldRun) {
                this.log(`Tasks in queue remaining: ${queue.size}`);
                await queue.dequeue();
            }

            if (stringsRes.data.length < limit) {
                running = false;
            }

            page++;
        }
    }
}
