import crowdinStats from "@json/crowdin-stats.json";
import { deDE, enUS, esES, frFR, huHU, itIT, jaJP, ptBR, ruRU } from "@mui/material/locale";
import { store } from "@src/store";
import log from "@src/utils/logger";
import i18n, { CallbackError } from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import resourcesToBackend from "i18next-resources-to-backend";
import { initReactI18next } from "react-i18next";
import { match } from "ts-pattern";

export enum Language {
    English = "en",
    German = "de",
    Hungarian = "hu",
    Japanese = "ja",
    French = "fr",
    Spanish = "es",
    Italian = "it",
    Portuguese = "pt",
    Russian = "ru",
}

const nativeLanguageNames = {
    [Language.English]: "English",
    [Language.German]: "Deutsch",
    [Language.Hungarian]: "magyar nyelv",
    [Language.Japanese]: "日本語",
    [Language.French]: "Français",
    [Language.Spanish]: "Español",
    [Language.Italian]: "Italiano",
    [Language.Portuguese]: "Português",
    [Language.Russian]: "русский",
};

// Languages that aren't officially supported by Dauntless
const communityLanguages = [Language.Hungarian];

const betaThreshold = 95;

export const currentLanguage = (): Language => i18n.languages[0] as Language;

export const muiLocaleComponent = () =>
    match(i18n.language)
        .with(Language.English, () => enUS)
        .with(Language.German, () => deDE)
        .with(Language.Hungarian, () => huHU)
        .with(Language.Japanese, () => jaJP)
        .with(Language.French, () => frFR)
        .with(Language.Spanish, () => esES)
        .with(Language.Italian, () => itIT)
        .with(Language.Portuguese, () => ptBR)
        .with(Language.Russian, () => ruRU)
        .otherwise(() => enUS);

export const getNativeLanguageName = (lang: Language): string | null => nativeLanguageNames[lang] ?? null;

export const isBetaLanguage = (lang: Language): boolean => {
    if (lang === Language.English) {
        return false;
    }

    if (!(lang in crowdinStats.progress)) {
        return true;
    }

    return crowdinStats.progress[lang] < betaThreshold;
};

export const isCommunityLanguage = (lang: Language): boolean => communityLanguages.indexOf(lang) > -1;

export const flagCode = (lang: Language): string =>
    match(lang)
        .with(Language.English, () => "us")
        .with(Language.German, () => "de")
        .with(Language.Hungarian, () => "hu")
        .with(Language.Japanese, () => "jp")
        .with(Language.French, () => "fr")
        .with(Language.Spanish, () => "es")
        .with(Language.Italian, () => "it")
        .with(Language.Portuguese, () => "br")
        .with(Language.Russian, () => "ru")
        .otherwise(() => "x");

export const ttry = (tryIdent: string, elseIdent: string): string => {
    if (i18n.exists(tryIdent)) {
        return i18n.t(tryIdent);
    }
    return i18n.t(elseIdent);
};

const detector = new LanguageDetector();
detector.addDetector({
    lookup: () => store.getState().configuration.language,
    name: "reduxState",
});
detector.addDetector({
    lookup: () => {
        // get parameters to overwrite languages
        //      * lang:         For testing
        //      * fb_locale:    Used by facebook for embeds
        const paramNames = ["lang", "fb_locale"];

        const urlParams = new URLSearchParams(window.location.search);

        for (const paramName of paramNames) {
            const value = urlParams.get(paramName);

            if (!value) {
                continue;
            }

            const lang = value.substring(0, 2);
            const hasLanguage = Object.values(Language).indexOf(lang as Language) > -1;

            if (!hasLanguage) {
                continue;
            }

            return lang;
        }

        return undefined;
    },
    name: "queryParams",
});

const dynamicallyImportLanguageFiles = resourcesToBackend(async (language, _namespace, callback) => {
    try {
        const [websiteData, itemData] = await Promise.all([
            import(`@json/i18n/${language}/${language}.json`),
            import(`@json/i18n/${language}/items.${language}.json`),
        ]);

        callback(null, { ...websiteData.default, ...itemData.default });
    } catch (err) {
        log.error("Error while loading translation files", { err });
        callback(err as CallbackError, null);
    }
});

i18n.use(dynamicallyImportLanguageFiles)
    .use(initReactI18next)
    .use(detector)
    .init({
        debug: DB_DEVMODE,
        detection: {
            caches: [],
            order: ["queryParams", "reduxState", "navigator"],
        },
        fallbackLng: Language.English,
        interpolation: {
            escapeValue: false,
        },
        load: "languageOnly",
        returnNull: false,
    });

export default i18n;
