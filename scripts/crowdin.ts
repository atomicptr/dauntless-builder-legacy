// Script to download localization data from Crowdin
//
// This is a script we allow use of console here
/* eslint-disable no-console */

import { ProjectsGroups, SourceStrings, StringTranslations, Translations } from "@crowdin/crowdin-api-client";
import axios from "axios";
import fs from "fs";
import * as os from "os";
import path from "path";
import Queue from "queue-promise";
import { fileURLToPath } from "url";
import yauzl from "yauzl";

if (!process.env.CROWDIN_TOKEN) {
    console.error("[crowdin] Please provide your personal crowdin token via the env variable CROWDIN_TOKEN!");
    process.exit(1);
}

const projectId = 528454;
const credentials = {
    token: process.env.CROWDIN_TOKEN,
};

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const translationsDir = path.join(__dirname, "..", "src", "translations");
const itemTranslationsDir = path.join(translationsDir, "items");

const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const buildAndDownloadTranslations = async (forceRebuild: boolean) => {
    const translationsApi = new Translations(credentials);

    const builds = await translationsApi.listProjectBuilds(projectId, {
        limit: 100,
    });

    let buildId = -1;
    let rebuild = false;

    if (builds.data.length >= 1) {
        const build = builds.data[0].data;

        buildId = build.id;

        const finishedAt = new Date((build as unknown as { finishedAt: string }).finishedAt);

        const threshold = 1000 * 60 * 30; // 30m

        if (Math.abs(Date.now() - finishedAt.getTime()) > threshold) {
            rebuild = true;
        }
    }

    if (forceRebuild || rebuild) {
        console.log("[crowdin] Need to rebuild project...");
        const buildRes = await translationsApi.buildProject(projectId);
        buildId = buildRes.data.id;
    } else {
        console.log("[crowdin] Used existing build:", buildId);
    }

    if (buildId === -1) {
        console.error("[crowdin] No build id?");
        process.exit(1);
    }

    let running = true;

    while (running) {
        const res = await translationsApi.checkBuildStatus(projectId, buildId);

        if (res.data.status === "finished") {
            running = false;
        } else {
            await wait(500);
        }
    }

    const downloadRes = await translationsApi.downloadTranslations(projectId, buildId);

    const url = downloadRes.data.url;

    const tmpdir = fs.mkdtempSync(path.join(os.tmpdir(), "db-crowdin-"));

    const res = await axios(url, {
        method: "GET",
        responseType: "stream",
    });

    const zipPath = path.join(tmpdir, "crowdin.zip");

    const writer = fs.createWriteStream(zipPath);
    const stream = res.data.pipe(writer);

    stream.on("finish", () => {
        yauzl.open(zipPath, (err, zipFile) => {
            if (err) {
                throw err;
            }

            zipFile.on("entry", entry => {
                if (!entry.fileName.endsWith(".json")) {
                    return;
                }

                const language = entry.fileName.substring(0, 2);
                const isItemsFile = entry.fileName.indexOf("items.") > -1;

                const targetFile = isItemsFile
                    ? path.join(itemTranslationsDir, `items.${language}.json`)
                    : path.join(translationsDir, `${language}.json`);

                const targetWriteStream = fs.createWriteStream(targetFile);

                zipFile.openReadStream(entry, (err, reader) => {
                    if (err) {
                        throw err;
                    }

                    reader.on("end", () => {
                        console.log(`[crowdin] Wrote ${targetFile}`);
                    });

                    reader.pipe(targetWriteStream);
                });
            });
        });
    });
};

const approveTranslationsWhichAreReferences = async () => {
    const projectGroupsApi = new ProjectsGroups(credentials);
    const sourceStringsApi = new SourceStrings(credentials);
    const stringTranslationsApi = new StringTranslations(credentials);

    const project = await projectGroupsApi.getProject(projectId);

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
        const stringsRes = await sourceStringsApi.listProjectStrings(projectId, {
            filter: "$t(",
            limit,
            offset: page * limit,
        });

        console.log(`[crowdin] working on page ${page}, found ${stringsRes.data.length} items...`);

        const strings = stringsRes.data
            .map(res => ({ id: res.data.id, text: res.data.text.toString() }))
            .filter(({ text }) => /^\$t\(.+\)$/gm.exec(text) !== null);

        const addTranslation = async (id: number, text: string, languageId: string) => {
            const translations = await stringTranslationsApi.listStringTranslations(projectId, id, languageId);

            // if it has already a translation ignore
            if (translations.data.length > 0) {
                return;
            }

            console.log(`[crowdin] Adding translation for ${languageId}: ${text}`);

            // add translation
            const translationRes = await stringTranslationsApi.addTranslation(projectId, {
                languageId,
                stringId: id,
                text: text,
            });

            console.log(`[crowdin] Approve translation for ${languageId}: ${translationRes.data.text}`);

            // approve translation
            await stringTranslationsApi.addApproval(projectId, {
                translationId: translationRes.data.id,
            });
        };

        for (const languageId of project.data.targetLanguageIds) {
            for (const string of strings) {
                queue.enqueue(() => addTranslation(string.id, string.text, languageId));
            }
        }

        while (queue.shouldRun) {
            console.log(`[crowdin] Tasks in queue remaining: ${queue.size}`);
            await queue.dequeue();
        }

        if (stringsRes.data.length < limit) {
            running = false;
        }

        page++;
    }
};

const main = async () => {
    const skipReferenceCheck = process.argv.some(arg => arg === "--skip-reference-check");
    const forceRebuild = process.argv.some(arg => arg === "--force-rebuild");

    if (!skipReferenceCheck) {
        console.log("[crowdin] Try to approve all translations which are references.");
        await approveTranslationsWhichAreReferences();
    }

    console.log("[crowdin] Build and download translations.");
    await buildAndDownloadTranslations(forceRebuild);
};

main();
