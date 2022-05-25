import i18n from "i18next";
import {initReactI18next} from "react-i18next";
import {deDE, enUS} from "@mui/material/locale";
import LanguageDetector from "i18next-browser-languagedetector";
import { i18nextPlugin as translationCheckPlugin } from 'translation-check'

import en from "./translations/en.json";
import de from "./translations/de.json";
import jp from "./translations/jp.json";

const resources = {
    en: {translation: en},
    de: {translation: de},
    jp: {translation: jp},
};

export enum Language {
    English= "en",
    German = "de",
    Japanese = "jp",
}

const nativeLanguageNames = {
    [Language.English]: "English",
    [Language.German]: "Deutsch",
    [Language.Japanese]: "日本語",
}

i18n.use(initReactI18next)
    .use(LanguageDetector)
    .use(translationCheckPlugin)
    .init({
        resources,
        fallbackLng: Language.English,
        load: "languageOnly",
        debug: DB_DEVMODE,
        interpolation: {
            escapeValue: false
        },
        detection: {
            order: ['localStorage', 'navigator'],
            lookupLocalStorage: "language",
        }
    });

export function muiLocaleComponent() {
    switch (i18n.languages[0]) {
        default:
        case Language.English:
            return enUS;
        case Language.German:
            return deDE;
    }
}

export function getNativeLanguageName(lang: Language): string|null {
    return nativeLanguageNames[lang] ?? null;
}

export default i18n;
