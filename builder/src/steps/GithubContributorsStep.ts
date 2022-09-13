import axios from "axios";
import fs from "fs";
import path from "path";
import sortJson from "sort-json";

import { Contributor } from "../../../src/pages/about/About";
import { sortJsonOptions } from "../constants";
import { RunConfig, Step } from "../Step";
import { WithStepLogger } from "../WithStepLogger";

// list of excluded contributors, use their Github name e.g. "ds-exe"
const excludeContributors: string[] = [];

export class GithubContributorsStep extends WithStepLogger implements Step {
    canRun(_verbose: boolean): boolean {
        return true;
    }

    isAllowedToFail(): boolean {
        return true;
    }

    name(): string {
        return "github-contributors";
    }

    async run(runConfig: RunConfig): Promise<void> {
        const filepath = path.join(runConfig.targetDir, "contributors.json");

        const contributors = await this.fetchContributors();

        const filtered = contributors
            .map(({ login, avatar_url, html_url, type, contributions }) => ({
                avatar_url,
                contributions,
                html_url,
                login,
                type,
            }))
            .sort((a, b) => b.contributions - a.contributions)
            .filter(contributor => contributor.type !== "Bot")
            .filter(contributor => excludeContributors.indexOf(contributor.login) === -1)
            .map(({avatar_url, html_url, login}) => ({avatar_url, html_url, login}));

        fs.writeFileSync(filepath, JSON.stringify(filtered, null, "    "));
        sortJson.overwrite(filepath, sortJsonOptions);
    }

    private async fetchContributors(): Promise<Contributor[]> {
        const res = await axios.get<Contributor[]>(
            "https://api.github.com/repos/atomicptr/dauntless-builder/contributors",
        );

        if (res.status !== 200) {
            throw Error(`Request to Github API failed: ${res.status} ${res.statusText}`);
        }

        return res.data;
    }
}
