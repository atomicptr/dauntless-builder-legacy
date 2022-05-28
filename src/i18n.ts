import { deDE, enUS, frFR, jaJP } from "@mui/material/locale";
import i18n from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { initReactI18next } from "react-i18next";
import { i18nextPlugin as translationCheckPlugin } from "translation-check";
import { match } from "ts-pattern";

import de from "./translations/de.json";
import en from "./translations/en.json";
import fr from "./translations/fr.json";
import enItems from "./translations/items/items.en.json";
import frItems from "./translations/items/items.fr.json";
import jp from "./translations/jp.json";

const resources = {
    de: { translation: de },
    en: { translation: { ...en, ...enItems } },
    fr: { translation: { ...fr, ...frItems } },
    jp: { translation: jp },
};

export enum Language {
    English = "en",
    German = "de",
    Japanese = "jp",
    French = "fr",
}

const nativeLanguageNames = {
    [Language.English]: "English",
    [Language.German]: "Deutsch",
    [Language.Japanese]: "日本語",
    [Language.French]: "Français",
};

i18n.use(initReactI18next)
    .use(LanguageDetector)
    .use(translationCheckPlugin)
    .init({
        debug: DB_DEVMODE,
        detection: {
            lookupLocalStorage: "language",
            order: ["localStorage", "navigator"],
        },
        fallbackLng: Language.English,
        interpolation: {
            escapeValue: false,
        },
        load: "languageOnly",
        resources,
    });

export const muiLocaleComponent = () =>
    match(i18n.languages[0])
        .with(Language.English, () => enUS)
        .with(Language.German, () => deDE)
        .with(Language.Japanese, () => jaJP)
        .with(Language.French, () => frFR)
        .otherwise(() => enUS);

export const getNativeLanguageName = (lang: Language): string | null => nativeLanguageNames[lang] ?? null;

export const ttry = (tryIdent: string, elseIdent: string): string => {
    if (i18n.exists(tryIdent)) {
        return i18n.t(tryIdent);
    }
    return i18n.t(elseIdent);
};

export default i18n;
