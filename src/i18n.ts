import { deDE, enUS, frFR, jaJP } from "@mui/material/locale";
import i18n from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { initReactI18next } from "react-i18next";
import { i18nextPlugin as translationCheckPlugin } from "translation-check";

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

export function muiLocaleComponent() {
    switch (i18n.languages[0]) {
        default:
        case Language.English:
            return enUS;
        case Language.German:
            return deDE;
        case Language.Japanese:
            return jaJP;
        case Language.French:
            return frFR;
    }
}

export function getNativeLanguageName(lang: Language): string | null {
    return nativeLanguageNames[lang] ?? null;
}

export default i18n;
