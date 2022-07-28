// Script to build the public/sitemap.xml file
//
// This is a script we allow use of console here
/* eslint-disable no-console */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

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

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const targetDir = path.join(__dirname, "..", "public");
const targetFile = path.join(targetDir, "sitemap.xml");
const metaBuildsFile = path.join(__dirname, "..", "src", "json", "meta-builds.json");

const main = () => {
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

    console.log("[build:sitemap] Writing sitemap data to file...");
    fs.writeFileSync(targetFile, output);
};

main();
