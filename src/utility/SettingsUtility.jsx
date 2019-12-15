import { detectLanguage, availableLanguages } from "../components/I18NProvider";

const defaultOptions = {
    theme: "light",
    language: detectLanguage()
};

export default class SettingsUtility {

    static boolify(val) {
        if(typeof val === "boolean") {
            return val;
        }

        return val === "true";
    }

    static getTheme() {
        // support for people with old setting...
        if (SettingsUtility.boolify(SettingsUtility.get("darkModeEnabled"))) {
            SettingsUtility.set("theme", "dark");
            SettingsUtility.delete("darkModeEnabled");
        }

        return SettingsUtility.get("theme");
    }

    static setDarkModeEnabled(val) {
        if (SettingsUtility.boolify(val)) {
            SettingsUtility.set("theme", "dark");
        } else {
            SettingsUtility.set("theme", "light");
        }
    }

    static getLanguage() {
        const lang = SettingsUtility.get("language");
        if (availableLanguages().includes(lang)) {
            return lang;
        }
        return defaultOptions.language;
    }

    static setLanguage({value: lang}) {
        console.log("change language:", lang);
        if (typeof lang === "string" && availableLanguages().includes(lang)) {
            SettingsUtility.set("language", lang);
        }
    }

    static set(key, value) {
        localStorage.setItem("__db_settings_" + key, value);
    }

    static get(key) {
        // key is not know, return null
        if(!(key in defaultOptions)) {
            return null;
        }

        return localStorage.getItem("__db_settings_" + key) || defaultOptions[key];
    }

    static has(key) {
        return ("__db_settings_" + key) in localStorage;
    }

    static delete(key) {
        localStorage.removeItem("__db_settings_" + key);
    }
}
