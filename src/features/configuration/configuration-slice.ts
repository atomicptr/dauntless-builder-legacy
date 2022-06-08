import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import i18n, { Language } from "@src/i18n";
import { RootState } from "@src/store";

interface ConfigurationState {
    language?: Language;
}

const initialState: ConfigurationState = {
    language: undefined,
};

export const configurationSlice = createSlice({
    initialState,
    name: "build",
    reducers: {
        setLanguage: (state, action: PayloadAction<Language>) => {
            state.language = action.payload;
            i18n.changeLanguage(action.payload);
        },
    },
});

export const { setLanguage } = configurationSlice.actions;

export const selectConfiguration = (state: RootState) => state.configuration;

export default configurationSlice.reducer;
