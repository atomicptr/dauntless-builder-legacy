import fs from "fs";
import path from "path";
import sortJson from "sort-json";

import { sortJsonOptions } from "../constants";
import { RunConfig, Step } from "../Step";
import { GoogleSpreadsheetClient } from "../utils/GoogleSpreadsheetClient";
import { WithStepLogger } from "../WithStepLogger";

const spreadsheetId = "1Kv3nlr7y5DJB_olhATqXXh-jPCkDygNCVyHkDwllTsc";

interface TrialsBuildsFile {
    title: string;
    behemoths: Behemoth[];
}

interface Behemoth {
    title: string;
    modifiers: string[];
    consumables: string[];
    tips?: string[];
    builds: string[];
}

export class TrialsBuildsStep extends WithStepLogger implements Step {
    canRun(_verbose: boolean): boolean {
        if (!process.env.GOOGLE_SHEETS_APIKEY) {
            this.error("Required environment variable GOOGLE_SHEETS_APIKEY is not set.");
            return false;
        }

        return true;
    }

    isAllowedToFail(): boolean {
        return true;
    }

    name(): string {
        return "trials";
    }

    async run(runConfig: RunConfig): Promise<void> {
        if (!process.env.GOOGLE_SHEETS_APIKEY) {
            return;
        }

        const client = new GoogleSpreadsheetClient(process.env.GOOGLE_SHEETS_APIKEY, spreadsheetId);

        const { title, sheets } = await client.sheetData();

        this.log(`Spreadhsheet: ${title} found.`);

        const removedSheets = ["Summary", "Nayzaga"];

        const behemothNames = sheets
            .filter(sheet => removedSheets.indexOf(sheet.title) === -1)
            .map(sheet => sheet.title)
            .map(title => (title.indexOf(" ") > -1 ? `'${title}'` : title));

        const trialsBuilds: TrialsBuildsFile = {
            behemoths: [],
            title,
        };

        const res = await client.batchGet(
            behemothNames
                .map(behemothName => [
                    `${behemothName}!B1:N3`, // Behemoth title
                    `${behemothName}!B7:C11`, // Behemoth modifiers
                    `${behemothName}!E7:F9`, // Behemoth consumables
                    `${behemothName}!E18:I25`, // Behemoth tips
                    `${behemothName}!H7:N7`, // Behemoth builds
                ])
                .flat(10),
        );

        const cleanString = (str: string) => str.replace(/\n/gm, "").replace(/\t/gm, "");

        const cleanArray = (arr: (string | unknown)[]) =>
            arr.filter(elem => typeof elem === "string").map(elem => cleanString(elem as string));

        for (const behemothName of behemothNames) {
            const values = client.transformResult(res, [
                { exportAs: "title", range: `${behemothName}!B1:N3` },
                { exportAs: "modifiers", range: `${behemothName}!B7:C11` },
                { exportAs: "consumables", range: `${behemothName}!E7:F9` },
                { exportAs: "tips", range: `${behemothName}!E18:I25` },
                { exportAs: "builds", range: `${behemothName}!H7:N7` },
            ]);

            const { title, modifiers, consumables, tips, builds } = values;

            trialsBuilds.behemoths.push({
                builds: (builds as string[])
                    .map(build => this.parseBuildEntry(build))
                    .filter(build => build !== null) as string[],
                consumables: cleanArray(consumables as string[]),
                modifiers: cleanArray(modifiers as string[]),
                tips:
                    tips !== undefined
                        ? cleanArray((tips as string).split("*").filter(tip => tip.trim().length > 0))
                        : undefined,
                title: cleanString(title as string),
            });
        }

        const targetFile = path.join(runConfig.targetDir, "trials-builds.json");

        this.log("Writing file", targetFile);

        fs.writeFileSync(targetFile, JSON.stringify(trialsBuilds, null, "    "));
        sortJson.overwrite(targetFile, sortJsonOptions);

        this.log("Adding strings to en.json translation file...");

        const translationBaseFilePath = path.join(runConfig.i18nBaseDir, "en", "en.json");
        const translationRaw = fs.readFileSync(translationBaseFilePath);
        const translationJson = JSON.parse(translationRaw.toString());

        translationJson["pages"]["trials"]["generated"] = {
            tips: {},
            title,
        };

        for (const behemoth of trialsBuilds.behemoths) {
            if (!behemoth.tips) {
                continue;
            }

            for (const index in behemoth.tips) {
                translationJson["pages"]["trials"]["generated"].tips[`${behemoth.title}.${index}`] =
                    behemoth.tips[index];
            }
        }

        fs.writeFileSync(translationBaseFilePath, JSON.stringify(translationJson, null, "    "));
        sortJson.overwrite(translationBaseFilePath, sortJsonOptions);
    }

    private parseBuildEntry(entry: string) {
        const regex = /=HYPERLINK\(\\?"https:\/\/www\.dauntless-builder\.com\/b\/([a-zA-Z0-9]+)\\?",\s*\\?"(.*)\\?"\)/g;
        const matches = regex.exec(entry.replace("\n", " "));

        if (!matches) {
            return null;
        }

        return matches[1];
    }
}
