import fs from "fs";
import path from "path";

import { RunConfig, Step } from "../Step";
import { WithStepLogger } from "../WithStepLogger";

interface SitemapEntry {
    url: string;
    priority: number;
}

const metaBuildPriority = 0.5;

const staticPaths: SitemapEntry[] = [
    {
        priority: 1.0,
        url: "https://www.dauntless-builder.com/",
    },
    {
        priority: 0.7,
        url: "https://www.dauntless-builder.com/b/new/",
    },
    {
        priority: 0.7,
        url: "https://www.dauntless-builder.com/b/finder/",
    },
    {
        priority: 0.7,
        url: "https://www.dauntless-builder.com/b/meta/",
    },
];

export class SitemapStep extends WithStepLogger implements Step {
    canRun(_verbose: boolean): boolean {
        return true;
    }

    isAllowedToFail(): boolean {
        return false;
    }

    name(): string {
        return "sitemap";
    }

    async run(runConfig: RunConfig): Promise<void> {
        const targetFile = path.join(runConfig.publicDir, "sitemap.xml");
        const metaBuildsFile = path.join(runConfig.targetDir, "meta-builds.json");

        const entries = [...staticPaths];

        const metaBuildsRaw = fs.readFileSync(metaBuildsFile);
        const metaBuildsJson = JSON.parse(metaBuildsRaw.toString());

        const builds = [];

        for (const category of metaBuildsJson.categories) {
            for (const build of category.builds) {
                builds.push(build.buildId);
            }
        }

        builds
            .filter((value, index, self) => self.indexOf(value) === index)
            .forEach(build => {
                entries.push({
                    priority: metaBuildPriority,
                    url: `https://www.dauntless-builder.com/b/${build}`,
                });
            });

        let output = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9 http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
`;

        entries.forEach(entry => {
            output += `
    <url>
        <loc>${entry.url}</loc>
        <priority>${entry.priority}</priority>
    </url>
`;
        });

        output += "</urlset>";

        this.log(`Writing sitemap data to file: ${targetFile}...`);
        fs.writeFileSync(targetFile, output);
    }
}
