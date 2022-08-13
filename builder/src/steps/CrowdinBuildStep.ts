import { Translations } from "@crowdin/crowdin-api-client";
import axios from "axios";
import fs from "fs";
import os from "os";
import path from "path";
import yauzl from "yauzl";

import { crowdinProjectId } from "../constants";
import { RunConfig, Step } from "../Step";
import { wait } from "../utils/wait";
import { WithStepLogger } from "../WithStepLogger";

export class CrowdinBuildStep extends WithStepLogger implements Step {
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
        return "crowdin-build";
    }

    async run(runConfig: RunConfig): Promise<void> {
        if (!process.env.CROWDIN_TOKEN) {
            return;
        }

        const forceRebuild = !!process.env.CROWDIN_FORCE_REBUILD;
        const itemTranslationsDir = path.join(runConfig.translationDir, "items");

        const credentials = {
            token: process.env.CROWDIN_TOKEN,
        };

        const translationsApi = new Translations(credentials);

        const builds = await translationsApi.listProjectBuilds(crowdinProjectId, {
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
            this.log("Need to rebuild project...");
            const buildRes = await translationsApi.buildProject(crowdinProjectId);
            buildId = buildRes.data.id;
        } else {
            this.log("Used existing build:", buildId);
        }

        if (buildId === -1) {
            this.fatal("No build id?");
        }

        let running = true;

        while (running) {
            const res = await translationsApi.checkBuildStatus(crowdinProjectId, buildId);

            if (res.data.status === "finished") {
                running = false;
            } else {
                await wait(500);
            }
        }

        const downloadRes = await translationsApi.downloadTranslations(crowdinProjectId, buildId);

        const url = downloadRes.data.url;

        const tmpdir = fs.mkdtempSync(path.join(os.tmpdir(), "db-crowdin-"));

        const res = await axios(url, {
            method: "GET",
            responseType: "stream",
        });

        return new Promise(resolve => {
            const zipPath = path.join(tmpdir, "crowdin.zip");

            const writer = fs.createWriteStream(zipPath);
            const stream = res.data.pipe(writer);

            stream.on("finish", () => {
                yauzl.open(zipPath, (err, zipFile) => {
                    if (err) {
                        throw err;
                    }

                    let entryCounter = 0;

                    zipFile.on("entry", entry => {
                        if (!entry.fileName.endsWith(".json")) {
                            return;
                        }

                        entryCounter++;

                        const language = entry.fileName.substring(0, 2);
                        const isItemsFile = entry.fileName.indexOf("items.") > -1;

                        const targetFile = isItemsFile
                            ? path.join(itemTranslationsDir, `items.${language}.json`)
                            : path.join(runConfig.translationDir, `${language}.json`);

                        const targetWriteStream = fs.createWriteStream(targetFile);

                        zipFile.openReadStream(entry, (err, reader) => {
                            if (err) {
                                throw err;
                            }

                            reader.on("end", () => {
                                entryCounter--;
                                this.log(`Wrote ${targetFile}`);
                            });

                            reader.pipe(targetWriteStream);
                        });
                    });

                    zipFile.on("end", async () => {
                        while (entryCounter > 0) {
                            await wait(100);
                        }
                        this.log("Finished extracting zip file.");
                        resolve();
                    });
                });
            });
        });
    }
}
