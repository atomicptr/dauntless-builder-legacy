// This code HAS to be the same as the one in scripts/items-i18n.js
const createItemTranslationIdentifier = (...parts: string[]): string =>
    ["item", ...parts]
        .map(p => p.toString().toLowerCase().replace(/\s/g, "-").replace(/ü/g, "u").replace(/[']/g, "").trim())
        .join(".");

export default createItemTranslationIdentifier;
