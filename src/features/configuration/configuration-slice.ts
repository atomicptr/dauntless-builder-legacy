import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import i18n, { Language } from "@src/i18n";
import { RootState } from "@src/store";

interface ConfigurationState {
    devMode: boolean;
    language?: Language;
}

const initialState: ConfigurationState = {
    devMode: DB_DEVMODE,
    language: undefined,
};

export const configurationSlice = createSlice({
    initialState,
    name: "build",
    reducers: {
        setDevMode: (state, action: PayloadAction<boolean>) => {
            state.devMode = DB_DEVMODE || action.payload;
        },
        setLanguage: (state, action: PayloadAction<Language>) => {
            state.language = action.payload;
            i18n.changeLanguage(action.payload);
        },
    },
});

const initState = (state: ConfigurationState) => Object.assign({}, initialState, state);

export const { setLanguage, setDevMode } = configurationSlice.actions;

export const selectConfiguration = (state: RootState) => ({
    ...initState(state.configuration),
    devMode: DB_DEVMODE || state.configuration.devMode,
});

export default configurationSlice.reducer;
