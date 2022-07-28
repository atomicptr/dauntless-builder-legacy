import { deDE, enUS, esES, frFR, jaJP } from "@mui/material/locale";
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
    Japanese = "ja",
    French = "fr",
    Spanish = "es",
}

const nativeLanguageNames = {
    [Language.English]: "English",
    [Language.German]: "Deutsch",
    [Language.Japanese]: "日本語",
    [Language.French]: "Français",
    [Language.Spanish]: "Español",
};

const betaLanguages = [Language.German, Language.Japanese, Language.French, Language.Spanish];

export const currentLanguage = (): Language => i18n.languages[0] as Language;

export const muiLocaleComponent = () =>
    match(i18n.language)
        .with(Language.English, () => enUS)
        .with(Language.German, () => deDE)
        .with(Language.Japanese, () => jaJP)
        .with(Language.French, () => frFR)
        .with(Language.Spanish, () => esES)
        .otherwise(() => enUS);

export const getNativeLanguageName = (lang: Language): string | null => nativeLanguageNames[lang] ?? null;

export const isBetaLanguage = (lang: Language): boolean => betaLanguages.indexOf(lang) > -1;

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

const dynamicallyImportLanguageFiles = resourcesToBackend(async (language, _namespace, callback) => {
    try {
        const [websiteData, itemData] = await Promise.all([
            import(`@src/translations/${language}.json`),
            import(`@src/translations/items/items.${language}.json`),
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
            order: ["reduxState", "navigator"],
        },
        fallbackLng: Language.English,
        interpolation: {
            escapeValue: false,
        },
        load: "languageOnly",
    });

export default i18n;
