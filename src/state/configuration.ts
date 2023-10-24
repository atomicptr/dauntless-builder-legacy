import i18n, { Language } from "@src/i18n";
import { stateIdent } from "@src/state/common";
import { atomWithStorage } from "jotai/utils";

export interface ConfigurationState {
    devMode: boolean;
    language?: Language;
    lightModeEnabled: boolean;
    finderPerkMatchingEnabled: boolean;
}

export const configurationAtom = atomWithStorage<ConfigurationState>(stateIdent("configuration"), {
    devMode: DB_DEVMODE,
    finderPerkMatchingEnabled: true,
    language: undefined,
    lightModeEnabled: false,
});

export const setDevMode = (value: boolean) => (state: ConfigurationState) => ({
    ...state,
    devMode: DB_DEVMODE || value,
});

export const setFinderPerkMatching = (value: boolean) => (state: ConfigurationState) => ({
    ...state,
    finderPerkMatchingEnabled: value,
});

export const setLanguage = (language: Language) => (state: ConfigurationState) => {
    i18n.changeLanguage(language);
    return {
        ...state,
        language,
    };
};

export const setLightModeEnabled = (value: boolean) => (state: ConfigurationState) => ({
    ...state,
    lightModeEnabled: value,
});
