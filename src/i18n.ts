import { deDE, enUS, esES, frFR, jaJP } from "@mui/material/locale";
import { store } from "@src/store";
import i18n from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { initReactI18next } from "react-i18next";
import { i18nextPlugin as translationCheckPlugin } from "translation-check";
import { match } from "ts-pattern";

import de from "./translations/de.json";
import en from "./translations/en.json";
import es from "./translations/es.json";
import fr from "./translations/fr.json";
import deItems from "./translations/items/items.de.json";
import enItems from "./translations/items/items.en.json";
import esItems from "./translations/items/items.es.json";
import frItems from "./translations/items/items.fr.json";
import jaItems from "./translations/items/items.ja.json";
import ja from "./translations/ja.json";

const resources = {
    de: { translation: { ...de, ...deItems } },
    en: { translation: { ...en, ...enItems } },
    es: { translation: { ...es, ...esItems } },
    fr: { translation: { ...fr, ...frItems } },
    ja: { translation: { ...ja, ...jaItems } },
};

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
    match(i18n.languages[0])
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

i18n.use(initReactI18next)
    .use(detector)
    .use(translationCheckPlugin)
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
        resources,
    });

export default i18n;
