import axios from "axios";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const spreadsheetId = "1-I4LQ_8uNqV9LuybXhz2wjmcPeTNNGWRZ-kFjsckwtk";
const apiKey = process.env.GOOGLE_SHEETS_APIKEY;

const baseUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}`;

if (!apiKey) {
    console.log("Please provide GOOGLE_SHEETS_APIKEY as an environment variable to run this script.");
    process.exit(0); // not required, therefore exit 0 without api key
}

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const targetDir = path.join(__dirname, "..", "src", "json");
const translationDir = path.join(__dirname, "..", "src", "translations");
const translationBaseFilePath = path.join(translationDir, "en.json");

const dec2hex = dec => Number(parseInt(dec, 10)).toString(16).toUpperCase();

const tiersByColor = {
    "#E06666": 1,
    "#F6B26B": 2,
    "#FFD966": 3,
    "#93C47D": 4,
};

const color2hex = color => {
    const r = dec2hex(Math.floor(color.red * 255));
    const g = dec2hex(Math.floor(color.green * 255));
    const b = dec2hex(Math.floor(color.blue * 255));
    return "#" + r + g + b;
};

const sheetsData = async () => {
    const res = await axios.get(`${baseUrl}?key=${apiKey}`);

    if (res.status !== 200) {
        console.error("ERR", res.data);
        process.exit(1);
    }

    return {
        title: res.data.properties.title,
        sheets: res.data.sheets.map(({ properties: { index, title, tabColor } }) => ({
            index,
            title,
            tier: tiersByColor[color2hex(tabColor)],
        })),
    };
};

const batchGet = async ranges => {
    const rangesStr = ranges.map(r => `ranges=${r}`).join("&");

    const res = await axios.get(`${baseUrl}/values:batchGet?valueRenderOption=FORMULA&key=${apiKey}&` + rangesStr);

    if (res.status !== 200) {
        console.error("ERR", res.data);
        process.exit(1);
    }

    const result = {};

    res.data.valueRanges.forEach(valueRange => {
        if (!Array.isArray(valueRange.values)) {
            return;
        }
        const value = valueRange.values.flat(10);
        result[valueRange.range] = value.length === 1 ? value[0] : value;
    });

    return result;
};

const parseBuildEntry = (entry, subcategory = null, element = null) => {
    const regex = /=HYPERLINK\(\\?"https:\/\/www\.dauntless-builder\.com\/b\/([a-zA-Z0-9]+)\\?",\s*\\?"(.*)\\?"\)/g;
    const matches = regex.exec(entry.replace("\n", " "));

    if (!matches) {
        return entry;
    }

    return {
        title: matches[2],
        buildId: matches[1],
        subcategory, // TODO: properly parse this
        vsElement: parseElement(element),
    };
};

const parseElement = text => {
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
};

const getFromRange = (ranges, exportData) => {
    let newData = {};

    const nameByRange = range => {
        const r = exportData.find(r => r.range === range);
        if (r) {
            return r.exportAs;
        }
        return `UNKNOWN-${range}`;
    };

    for (const entry of exportData) {
        newData[nameByRange(entry.range)] = ranges[entry.range];
    }

    return newData;
};

const main = async () => {
    const { title, sheets } = await sheetsData();

    const newSheets = {
        title,
        categories: [],
    };

    const ranges = await batchGet([
        ...["Discipline", "Revenant", "Tempest", "Bastion", "Artificer", "Iceborne", "Catalyst"]
            .map(title => [
                `${title}!B1:T1`,
                `${title}!B3:T7`,
                `${title}!D9:T9`,
                `${title}!D11:E17`,
                `${title}!G11:H17`,
                `${title}!J11:K17`,
                `${title}!M11:N17`,
                `${title}!P11:Q17`,
                `${title}!S11:T17`,
            ])
            .flat(10),
        `Escalations!B1:T1`,
        `Escalations!B3:T7`,
        `Escalations!D9:T9`,
        `Escalations!D11:E17`,
        `Escalations!G11:H17`,
        `Escalations!J11:K17`,
        `Escalations!M11:N17`,
        `Escalations!P11:Q17`,
        `Escalations!S11:T17`,
        `Escalations!D19:T19`,
        `Escalations!D21:E27`,
        `Escalations!G21:H27`,
        `Escalations!J21:K27`,
        `Escalations!M21:N27`,
        `Escalations!P21:Q27`,
        `Escalations!S21:T27`,
        `Escalations!D29:T29`,
        `Escalations!D31:E37`,
        `Escalations!G31:H37`,
        `Escalations!J31:K37`,
        `Escalations!M31:N37`,
        `Escalations!P31:Q37`,
        `Escalations!S31:T37`,
        "Exotics!B1:O1",
        "Exotics!B3:O7",
        "Exotics!D9:O9",
        "Exotics!D11:O11",
        "Exotics!D12:O12",
        "Exotics!D13:O13",
        "Exotics!D14:O14",
        "Exotics!D15:O15",
        "Exotics!D16:O16",
        "Exotics!D17:O17",
    ]);

    for (const sheet of sheets) {
        if (
            ["Discipline", "Revenant", "Tempest", "Bastion", "Artificer", "Iceborne", "Catalyst"].indexOf(sheet.title) >
            -1
        ) {
            const values = getFromRange(ranges, [
                { range: `${sheet.title}!B3:T7`, exportAs: "description" },
                { range: `${sheet.title}!D11:E17`, exportAs: "buildsBlaze" },
                { range: `${sheet.title}!G11:H17`, exportAs: "buildsFrost" },
                { range: `${sheet.title}!J11:K17`, exportAs: "buildsShock" },
                { range: `${sheet.title}!M11:N17`, exportAs: "buildsTerra" },
                { range: `${sheet.title}!P11:Q17`, exportAs: "buildsRadiant" },
                { range: `${sheet.title}!S11:T17`, exportAs: "buildsUmbral" },
            ]);

            for (const element of [
                "buildsBlaze",
                "buildsFrost",
                "buildsShock",
                "buildsTerra",
                "buildsRadiant",
                "buildsUmbral",
            ]) {
                values[element] = values[element].flat(10).map(build => parseBuildEntry(build, null, element));
            }

            const { description, buildsBlaze, buildsFrost, buildsShock, buildsTerra, buildsRadiant, buildsUmbral } =
                values;

            newSheets.categories.push({
                index: sheet.index,
                name: sheet.title,
                description,
                tier: sheet.tier,
                builds: [
                    ...buildsBlaze,
                    ...buildsFrost,
                    ...buildsShock,
                    ...buildsTerra,
                    ...buildsRadiant,
                    ...buildsUmbral,
                ].filter(entry => typeof entry === "object"),
            });

            continue;
        }

        if (sheet.title === "Escalations") {
            const values = getFromRange(ranges, [
                { range: `Escalations!B1:T1`, exportAs: "title" },
                { range: `Escalations!B3:T7`, exportAs: "description" },

                { range: `Escalations!D9:T9`, exportAs: "preEscaOverview" },
                { range: `Escalations!D11:E17`, exportAs: "preEscaBuildsBlaze" },
                { range: `Escalations!G11:H17`, exportAs: "preEscaBuildsFrost" },
                { range: `Escalations!J11:K17`, exportAs: "preEscaBuildsShock" },
                { range: `Escalations!M11:N17`, exportAs: "preEscaBuildsTerra" },
                { range: `Escalations!P11:Q17`, exportAs: "preEscaBuildsRadiant" },
                { range: `Escalations!S11:T17`, exportAs: "preEscaBuildsUmbral" },

                { range: `Escalations!D19:T19`, exportAs: "legendariesOverview" },
                { range: `Escalations!D21:E27`, exportAs: "legendariesBuildsBlaze" },
                { range: `Escalations!G21:H27`, exportAs: "legendariesBuildsFrost" },
                { range: `Escalations!J21:K27`, exportAs: "legendariesBuildsShock" },
                { range: `Escalations!M21:N27`, exportAs: "legendariesBuildsTerra" },
                { range: `Escalations!P21:Q27`, exportAs: "legendariesBuildsRadiant" },
                { range: `Escalations!S21:T27`, exportAs: "legendariesBuildsUmbral" },

                { range: `Escalations!D29:T29`, exportAs: "heroicsOverview" },
                { range: `Escalations!D31:E37`, exportAs: "heroicsBuildsBlaze" },
                { range: `Escalations!G31:H37`, exportAs: "heroicsBuildsFrost" },
                { range: `Escalations!J31:K37`, exportAs: "heroicsBuildsShock" },
                { range: `Escalations!M31:N37`, exportAs: "heroicsBuildsTerra" },
                { range: `Escalations!P31:Q37`, exportAs: "heroicsBuildsRadiant" },
                { range: `Escalations!S31:T37`, exportAs: "heroicsBuildsUmbral" },
            ]);

            for (const key in values) {
                if (key.indexOf("Builds") === -1) {
                    continue;
                }
                if (typeof values[key] === "string") {
                    values[key] = [parseBuildEntry(values[key])];
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

                values[key] = values[key].flat(10).map(build => parseBuildEntry(build, subcategory, key));
            }

            const {
                description,
                preEscaOverview,
                preEscaBuildsBlaze,
                preEscaBuildsFrost,
                preEscaBuildsShock,
                preEscaBuildsTerra,
                preEscaBuildsRadiant,
                preEscaBuildsUmbral,
                legendariesOverview,
                legendariesBuildsBlaze,
                legendariesBuildsFrost,
                legendariesBuildsShock,
                legendariesBuildsTerra,
                legendariesBuildsRadiant,
                legendariesBuildsUmbral,
                heroicsOverview,
                heroicsBuildsBlaze,
                heroicsBuildsFrost,
                heroicsBuildsShock,
                heroicsBuildsTerra,
                heroicsBuildsRadiant,
                heroicsBuildsUmbral,
            } = values;

            newSheets.categories.push({
                index: sheet.index,
                name: sheet.title,
                description,
                tier: sheet.tier,
                builds: [
                    ...preEscaBuildsBlaze,
                    ...preEscaBuildsFrost,
                    ...preEscaBuildsShock,
                    ...preEscaBuildsTerra,
                    ...preEscaBuildsRadiant,
                    ...preEscaBuildsUmbral,
                    ...legendariesBuildsBlaze,
                    ...legendariesBuildsFrost,
                    ...legendariesBuildsShock,
                    ...legendariesBuildsTerra,
                    ...legendariesBuildsRadiant,
                    ...legendariesBuildsUmbral,
                    ...heroicsBuildsBlaze,
                    ...heroicsBuildsFrost,
                    ...heroicsBuildsShock,
                    ...heroicsBuildsTerra,
                    ...heroicsBuildsRadiant,
                    ...heroicsBuildsUmbral,
                ].filter(entry => typeof entry === "object"),
                subcategoryDescription: {
                    preEsca: preEscaOverview,
                    legendaries: legendariesOverview,
                    heroics: heroicsOverview,
                },
            });
        }

        if (sheet.title === "Exotics") {
            const values = getFromRange(ranges, [
                { range: "Exotics!B1:O1", exportAs: "title" },
                { range: "Exotics!B3:O7", exportAs: "description" },
                { range: "Exotics!D11:O11", exportAs: "The Hunger" },
                { range: "Exotics!D12:O12", exportAs: "Tragic Echo" },
                { range: "Exotics!D13:O13", exportAs: "Godhand" },
                { range: "Exotics!D14:O14", exportAs: "Prismatic Grace" },
                { range: "Exotics!D15:O15", exportAs: "Molten Edict" },
                { range: "Exotics!D16:O16", exportAs: "Skullforge" },
                { range: "Exotics!D17:O17", exportAs: "Twin Suns" },
            ]);

            for (const key in values) {
                if (["title", "description", "overview"].indexOf(key) > -1) {
                    continue;
                }
                if (typeof values[key] === "string") {
                    values[key] = [parseBuildEntry(values[key])];
                    continue;
                }
                if (!Array.isArray(values[key])) {
                    continue;
                }
                values[key] = values[key].flat(10).map(build => parseBuildEntry(build, key));
            }

            const { title, description } = values;

            newSheets.categories.push({
                index: sheet.index,
                name: sheet.title,
                description,
                tier: sheet.tier,
                builds: [
                    ...(values["The Hunger"] ?? []),
                    ...(values["Tragic Echo"] ?? []),
                    ...(values["Godhand"] ?? []),
                    ...(values["Prismatic Grace"] ?? []),
                    ...(values["Molten Edict"] ?? []),
                    ...(values["Skullforge"] ?? []),
                    ...(values["Twin Suns"] ?? []),
                ].filter(entry => typeof entry === "object"),
            });
        }
    }

    console.log("[build:metabuilds] Building meta-builds.json file...");
    fs.writeFileSync(path.join(targetDir, "meta-builds.json"), JSON.stringify(newSheets, null, "    "));

    console.log("[builds:metabuilds] Adding strings to en.json translation file...");
    const translationRaw = fs.readFileSync(translationBaseFilePath);
    const translationJson = JSON.parse(translationRaw.toString());

    translationJson["pages"]["metabuilds"]["generated"] = {
        categories: {},
        buildTitles: {},
    };

    translationJson["pages"]["metabuilds"]["generated"]["title"] = newSheets.title;

    for (const category of newSheets.categories) {
        translationJson["pages"]["metabuilds"]["generated"]["categories"][category.name] = {
            name: category.name,
            description: category.description,
            subcategoryDescription: category.subcategoryDescription,
        };

        for (const build of category.builds) {
            translationJson["pages"]["metabuilds"]["generated"]["buildTitles"][build.title] = build.title;
        }
    }

    fs.writeFileSync(translationBaseFilePath, JSON.stringify(translationJson, null, "    "));
};

main();
