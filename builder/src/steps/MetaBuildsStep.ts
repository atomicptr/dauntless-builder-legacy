import fs from "fs";
import path from "path";
import sortJson from "sort-json";

import { sortJsonOptions } from "../constants";
import { RunConfig, Step } from "../Step";
import { Color, color2hex } from "../utils/colors";
import { GoogleSpreadsheetClient } from "../utils/GoogleSpreadsheetClient";
import { WithStepLogger } from "../WithStepLogger";

const spreadsheetId = "1-I4LQ_8uNqV9LuybXhz2wjmcPeTNNGWRZ-kFjsckwtk";

const tiersByColor = {
    "#93C47D": 4,
    "#E06666": 1,
    "#F6B26B": 2,
    "#FFD966": 3,
};

interface MetaBuildsFile {
    title: string;
    categories: MetaBuildsCategory[];
}

interface MetaBuildsCategory {
    index: number;
    name: string;
    description: string;
    tier?: number;
    builds: MetaBuildsBuild[];
    subcategoryDescription?: {
        [ident: string]: string;
    };
}

interface MetaBuildsBuild {
    title: string;
    buildId: string;
    subcategory: string | null;
    vsElement: string | null;
}

export class MetaBuildsStep extends WithStepLogger implements Step {
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
        return "metabuilds";
    }

    async run(runConfig: RunConfig): Promise<void> {
        if (!process.env.GOOGLE_SHEETS_APIKEY) {
            return;
        }

        const client = new GoogleSpreadsheetClient(process.env.GOOGLE_SHEETS_APIKEY, spreadsheetId);

        const { title, sheets } = await client.sheetData(["tabColor"]);

        this.log(`Spreadhsheet: ${title} found.`);

        const newSheets: MetaBuildsFile = {
            categories: [],
            title,
        };

        const res = await client.batchGet([
            // If you edit this array, keep in mind the values are also used a bit further down
            ...["Discipline", "Revenant", "Tempest", "Bastion", "Artificer", "Iceborne", "Catalyst"]
                .map(title => [
                    `${title}!B1:T1`, // Build Sheet Title
                    `${title}!B3:T7`, // Build Sheet Description
                    `${title}!D9:T9`, // Build Sheet Overview
                    `${title}!D11:E17`, // vs Blaze
                    `${title}!G11:H17`, // vs Frost
                    `${title}!J11:K17`, // vs Shock
                    `${title}!M11:N17`, // vs Terra
                    `${title}!P11:Q17`, // vs Radiant
                    `${title}!S11:T17`, // vs Umbral
                ])
                .flat(10),
            "Escalations!B1:T1", // Escalations Sheet Title
            "Escalations!B3:T7", // Escalations Sheet Description
            "Escalations!D9:T9", // Pre Esca Overview
            "Escalations!D11:E17", // Pre Esca: vs Blaze
            "Escalations!G11:H17", // Pre Esca: vs Frost
            "Escalations!J11:K17", // Pre Esca: vs Shock
            "Escalations!M11:N17", // Pre Esca: vs Terra
            "Escalations!P11:Q17", // Pre Esca: vs Radiant
            "Escalations!S11:T17", // Pre Esca: vs Umbral
            "Escalations!D19:T19", // Legendaries Overview
            "Escalations!D21:E27", // Legendaries: vs Blaze
            "Escalations!G21:H27", // Legendaries: vs Frost
            "Escalations!J21:K27", // Legendaries: vs Shock
            "Escalations!M21:N27", // Legendaries: vs Terra
            "Escalations!P21:Q27", // Legendaries: vs Radiant
            "Escalations!S21:T27", // Legendaries: vs Umbral
            "Escalations!D29:T29", // Heroic Overview
            "Escalations!D31:E37", // Heroic: vs Blaze
            "Escalations!G31:H37", // Heroic: vs Frost
            "Escalations!J31:K37", // Heroic: vs Shock
            "Escalations!M31:N37", // Heroic: vs Terra
            "Escalations!P31:Q37", // Heroic: vs Radiant
            "Escalations!S31:T37", // Heroic: vs Umbral
            "Exotics!B1:O1", // Exotics Sheet Title
            "Exotics!B3:O7", // Exotics Sheet Description
            "Exotics!D9:O9", // Exotics Sheet Overview
            "Exotics!D11:O11", // Hunger Builds
            "Exotics!D12:O12", // Tragic Echo Builds
            "Exotics!D13:O13", // Godhand Builds
            "Exotics!D14:O14", // Prismatic Grace Builds
            "Exotics!D15:O15", // Molten Edict Builds
            "Exotics!D16:O16", // Skullforge Builds
            "Exotics!D17:O17", // Twin Suns Builds
        ]);

        for (const sheet of sheets) {
            if (
                ["Discipline", "Revenant", "Tempest", "Bastion", "Artificer", "Iceborne", "Catalyst"].indexOf(
                    sheet.title,
                ) > -1
            ) {
                const values = client.transformResult(res, [
                    { exportAs: "description", range: `${sheet.title}!B3:T7` },
                    { exportAs: "buildsBlaze", range: `${sheet.title}!D11:E17` },
                    { exportAs: "buildsFrost", range: `${sheet.title}!G11:H17` },
                    { exportAs: "buildsShock", range: `${sheet.title}!J11:K17` },
                    { exportAs: "buildsTerra", range: `${sheet.title}!M11:N17` },
                    { exportAs: "buildsRadiant", range: `${sheet.title}!P11:Q17` },
                    { exportAs: "buildsUmbral", range: `${sheet.title}!S11:T17` },
                ]);

                const newValues: {
                    [element: string]: MetaBuildsBuild[];
                } = {};

                for (const element of [
                    "buildsBlaze",
                    "buildsFrost",
                    "buildsShock",
                    "buildsTerra",
                    "buildsRadiant",
                    "buildsUmbral",
                ]) {
                    newValues[element] = (values[element] as string[])
                        .flat(10)
                        .map(build => this.parseBuildEntry(build as string, null, element)) as MetaBuildsBuild[];
                }

                const { description } = values;

                const { buildsBlaze, buildsFrost, buildsShock, buildsTerra, buildsRadiant, buildsUmbral } = newValues;

                newSheets.categories.push({
                    builds: [
                        ...buildsBlaze,
                        ...buildsFrost,
                        ...buildsShock,
                        ...buildsTerra,
                        ...buildsRadiant,
                        ...buildsUmbral,
                    ].filter(entry => typeof entry === "object"),
                    description: description as unknown as string,
                    index: sheet.index,
                    name: sheet.title,
                    tier: tiersByColor[color2hex(sheet.tabColor as Color) as keyof typeof tiersByColor],
                });

                continue;
            }

            if (sheet.title === "Escalations") {
                const values = client.transformResult(res, [
                    { exportAs: "title", range: "Escalations!B1:T1" },
                    { exportAs: "description", range: "Escalations!B3:T7" },

                    { exportAs: "preEscaOverview", range: "Escalations!D9:T9" },
                    { exportAs: "preEscaBuildsBlaze", range: "Escalations!D11:E17" },
                    { exportAs: "preEscaBuildsFrost", range: "Escalations!G11:H17" },
                    { exportAs: "preEscaBuildsShock", range: "Escalations!J11:K17" },
                    { exportAs: "preEscaBuildsTerra", range: "Escalations!M11:N17" },
                    { exportAs: "preEscaBuildsRadiant", range: "Escalations!P11:Q17" },
                    { exportAs: "preEscaBuildsUmbral", range: "Escalations!S11:T17" },

                    { exportAs: "legendariesOverview", range: "Escalations!D19:T19" },
                    { exportAs: "legendariesBuildsBlaze", range: "Escalations!D21:E27" },
                    { exportAs: "legendariesBuildsFrost", range: "Escalations!G21:H27" },
                    { exportAs: "legendariesBuildsShock", range: "Escalations!J21:K27" },
                    { exportAs: "legendariesBuildsTerra", range: "Escalations!M21:N27" },
                    { exportAs: "legendariesBuildsRadiant", range: "Escalations!P21:Q27" },
                    { exportAs: "legendariesBuildsUmbral", range: "Escalations!S21:T27" },

                    { exportAs: "heroicsOverview", range: "Escalations!D29:T29" },
                    { exportAs: "heroicsBuildsBlaze", range: "Escalations!D31:E37" },
                    { exportAs: "heroicsBuildsFrost", range: "Escalations!G31:H37" },
                    { exportAs: "heroicsBuildsShock", range: "Escalations!J31:K37" },
                    { exportAs: "heroicsBuildsTerra", range: "Escalations!M31:N37" },
                    { exportAs: "heroicsBuildsRadiant", range: "Escalations!P31:Q37" },
                    { exportAs: "heroicsBuildsUmbral", range: "Escalations!S31:T37" },
                ]);

                const newValues: {
                    [element: string]: (string | MetaBuildsBuild)[];
                } = {};

                for (const key in values) {
                    if (key.indexOf("Builds") === -1) {
                        continue;
                    }
                    if (typeof values[key] === "string") {
                        newValues[key] = [this.parseBuildEntry(values[key] as unknown as string) as unknown as string];
                        continue;
                    }
                    if (!Array.isArray(values[key])) {
                        continue;
                    }

                    const subcategory = key.startsWith("preEsca")
                        ? "preEsca"
                        : key.startsWith("legendaries")
                            ? "legendaries"
                            : key.startsWith("heroics")
                                ? "heroics"
                                : null;

                    newValues[key] = (values[key] as string[])
                        .flat(10)
                        .map(build => this.parseBuildEntry(build, subcategory, key)) as MetaBuildsBuild[];
                }

                const { description, preEscaOverview, legendariesOverview, heroicsOverview } = values;

                const {
                    preEscaBuildsBlaze,
                    preEscaBuildsFrost,
                    preEscaBuildsShock,
                    preEscaBuildsTerra,
                    preEscaBuildsRadiant,
                    preEscaBuildsUmbral,
                    legendariesBuildsBlaze,
                    legendariesBuildsFrost,
                    legendariesBuildsShock,
                    legendariesBuildsTerra,
                    legendariesBuildsRadiant,
                    legendariesBuildsUmbral,
                    heroicsBuildsBlaze,
                    heroicsBuildsFrost,
                    heroicsBuildsShock,
                    heroicsBuildsTerra,
                    heroicsBuildsRadiant,
                    heroicsBuildsUmbral,
                } = newValues;

                newSheets.categories.push({
                    builds: [
                        ...(<MetaBuildsBuild[]>preEscaBuildsBlaze),
                        ...(<MetaBuildsBuild[]>preEscaBuildsFrost),
                        ...(<MetaBuildsBuild[]>preEscaBuildsShock),
                        ...(<MetaBuildsBuild[]>preEscaBuildsTerra),
                        ...(<MetaBuildsBuild[]>preEscaBuildsRadiant),
                        ...(<MetaBuildsBuild[]>preEscaBuildsUmbral),
                        ...(<MetaBuildsBuild[]>legendariesBuildsBlaze),
                        ...(<MetaBuildsBuild[]>legendariesBuildsFrost),
                        ...(<MetaBuildsBuild[]>legendariesBuildsShock),
                        ...(<MetaBuildsBuild[]>legendariesBuildsTerra),
                        ...(<MetaBuildsBuild[]>legendariesBuildsRadiant),
                        ...(<MetaBuildsBuild[]>legendariesBuildsUmbral),
                        ...(<MetaBuildsBuild[]>heroicsBuildsBlaze),
                        ...(<MetaBuildsBuild[]>heroicsBuildsFrost),
                        ...(<MetaBuildsBuild[]>heroicsBuildsShock),
                        ...(<MetaBuildsBuild[]>heroicsBuildsTerra),
                        ...(<MetaBuildsBuild[]>heroicsBuildsRadiant),
                        ...(<MetaBuildsBuild[]>heroicsBuildsUmbral),
                    ].filter(entry => typeof entry === "object"),
                    description: description as unknown as string,
                    index: sheet.index,
                    name: sheet.title,
                    subcategoryDescription: {
                        heroics: heroicsOverview as unknown as string,
                        legendaries: legendariesOverview as unknown as string,
                        preEsca: preEscaOverview as unknown as string,
                    },
                    tier: tiersByColor[color2hex(sheet.tabColor as Color) as keyof typeof tiersByColor],
                });
            }

            if (sheet.title === "Exotics") {
                const values = client.transformResult(res, [
                    { exportAs: "title", range: "Exotics!B1:O1" },
                    { exportAs: "description", range: "Exotics!B3:O7" },
                    { exportAs: "The Hunger", range: "Exotics!D11:O11" },
                    { exportAs: "Tragic Echo", range: "Exotics!D12:O12" },
                    { exportAs: "Godhand", range: "Exotics!D13:O13" },
                    { exportAs: "Prismatic Grace", range: "Exotics!D14:O14" },
                    { exportAs: "Molten Edict", range: "Exotics!D15:O15" },
                    { exportAs: "Skullforge", range: "Exotics!D16:O16" },
                    { exportAs: "Twin Suns", range: "Exotics!D17:O17" },
                ]);

                const newValues: {
                    [element: string]: (string | MetaBuildsBuild)[];
                } = {};

                for (const key in values) {
                    if (["title", "description", "overview"].indexOf(key) > -1) {
                        continue;
                    }
                    if (typeof values[key] === "string") {
                        newValues[key] = [this.parseBuildEntry(values[key] as unknown as string) as unknown as string];
                        continue;
                    }
                    if (!Array.isArray(values[key])) {
                        continue;
                    }
                    newValues[key] = (values[key] as string[])
                        .flat(10)
                        .map(build => this.parseBuildEntry(build, key)) as MetaBuildsBuild[];
                }

                const { description } = values;

                newSheets.categories.push({
                    builds: [
                        ...(<MetaBuildsBuild[]>newValues["The Hunger"] ?? []),
                        ...(<MetaBuildsBuild[]>newValues["Tragic Echo"] ?? []),
                        ...(<MetaBuildsBuild[]>newValues["Godhand"] ?? []),
                        ...(<MetaBuildsBuild[]>newValues["Prismatic Grace"] ?? []),
                        ...(<MetaBuildsBuild[]>newValues["Molten Edict"] ?? []),
                        ...(<MetaBuildsBuild[]>newValues["Skullforge"] ?? []),
                        ...(<MetaBuildsBuild[]>newValues["Twin Suns"] ?? []),
                    ].filter(entry => typeof entry === "object"),
                    description: description as unknown as string,
                    index: sheet.index,
                    name: sheet.title,
                    tier: tiersByColor[color2hex(sheet.tabColor as Color) as keyof typeof tiersByColor],
                });
            }
        }

        this.log("Building meta-builds.json file...");

        const targetFile = path.join(runConfig.targetDir, "meta-builds.json");
        fs.writeFileSync(targetFile, JSON.stringify(newSheets, null, "    "));
        sortJson.overwrite(targetFile, sortJsonOptions);

        this.log("Adding strings to en.json translation file...");
        const translationBaseFilePath = path.join(runConfig.i18nBaseDir, "en", "en.json");
        const translationRaw = fs.readFileSync(translationBaseFilePath);
        const translationJson = JSON.parse(translationRaw.toString());

        translationJson["pages"]["metabuilds"]["generated"] = {
            buildTitles: {},
            categories: {},
        };

        translationJson["pages"]["metabuilds"]["generated"]["title"] = newSheets.title;

        const fixBuildTitle = (buildTitle: string) => {
            // replace behemoth titles
            Object.keys(translationJson.terms.behemoths).forEach(behemoth => {
                buildTitle = buildTitle.replace(behemoth, `$t(terms.behemoths.${behemoth})`);
            });

            const commonShortNames = {
                Chrono: "Chronovore",
                Frostwulf: "Frostwülf",
                Khara: "Kharabak",
                Malk: "Malkarion",
                Reza: "Rezakiri",
                Rift: "Riftstalker",
                Torg: "Torgadoro",
                Valo: "Valomyr",
                ["Wülf"]: "Frostwülf",
            };

            // replace short names
            Object.keys(commonShortNames).forEach(shortName => {
                const behemoth = commonShortNames[shortName as keyof typeof commonShortNames];
                buildTitle = buildTitle.replace(new RegExp(`^${shortName}`, "g"), `$t(terms.behemoths.${behemoth})`);
                buildTitle = buildTitle.replace(
                    new RegExp(`\\(${shortName}\\)`, "g"),
                    `($t(terms.behemoths.${behemoth}))`,
                );
            });

            // remove duplicate spaces
            while (buildTitle.indexOf("  ") > -1) {
                buildTitle = buildTitle.replace("  ", " ");
            }

            return buildTitle;
        };

        for (const category of newSheets.categories) {
            translationJson["pages"]["metabuilds"]["generated"]["categories"][category.name] = {
                description: category.description,
                name: category.name,
                subcategoryDescription: category.subcategoryDescription,
            };

            for (const build of category.builds) {
                translationJson["pages"]["metabuilds"]["generated"]["buildTitles"][build.title] = fixBuildTitle(
                    build.title,
                );
            }
        }

        fs.writeFileSync(translationBaseFilePath, JSON.stringify(translationJson, null, "    "));
        sortJson.overwrite(translationBaseFilePath, sortJsonOptions);
    }

    private parseBuildEntry(
        entry: string,
        subcategory: string | null = null,
        element: string | null = null,
    ): MetaBuildsBuild | string {
        const regex = /=[a-zA-Z]+\(\\?"https:\/\/www\.dauntless-builder\.com\/b\/([a-zA-Z0-9_.\-~]+)\\?",\s*\\?"(.*)\\?"\)/g;
        const matches = regex.exec(entry.replace("\n", " "));

        if (!matches) {
            return entry;
        }

        return {
            buildId: matches[1],
            subcategory,
            title: matches[2], // TODO: properly parse this
            vsElement: this.parseElement(element),
        };
    }

    private parseElement(text: string | null) {
        if (!text) {
            return null;
        }

        text = text.toLowerCase();

        if (text.indexOf("blaze") > -1) {
            return "Blaze";
        }

        if (text.indexOf("frost") > -1) {
            return "Frost";
        }

        if (text.indexOf("shock") > -1) {
            return "Shock";
        }

        if (text.indexOf("terra") > -1) {
            return "Terra";
        }

        if (text.indexOf("radiant") > -1) {
            return "Radiant";
        }

        if (text.indexOf("umbral") > -1) {
            return "Umbral";
        }

        return null;
    }
}
