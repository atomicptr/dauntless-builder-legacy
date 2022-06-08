import { Checkbox, FormControl, FormControlLabel, InputLabel, MenuItem, Select } from "@mui/material";
import PageTitle from "@src/components/PageTitle";
import { selectConfiguration, setDevMode, setLanguage } from "@src/features/configuration/configuration-slice";
import { useAppDispatch, useAppSelector } from "@src/hooks/redux";
import { currentLanguage, getNativeLanguageName, Language } from "@src/i18n";
import React from "react";
import { useTranslation } from "react-i18next";

const Settings: React.FC = () => {
    const dispatch = useAppDispatch();
    const { t } = useTranslation();
    const configuration = useAppSelector(selectConfiguration);

    return (
        <>
            <PageTitle title={t("pages.settings.title")} />

            <FormControl
                fullWidth
                sx={{ mt: 4 }}
            >
                <InputLabel>{t("pages.settings.language")}</InputLabel>
                <Select
                    label={t("pages.settings.language")}
                    onChange={ev => dispatch(setLanguage(ev.target.value as Language))}
                    value={currentLanguage()}
                >
                    {Object.keys(Language).map((key: string) => (
                        <MenuItem
                            key={key}
                            value={Language[key as keyof typeof Language]}
                        >
                            {getNativeLanguageName(Language[key as keyof typeof Language]) !== null
                                ? `${getNativeLanguageName(Language[key as keyof typeof Language])} (${key})`
                                : key}
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>

            <FormControlLabel
                control={
                    <Checkbox
                        checked={configuration.devMode}
                        disabled={DB_DEVMODE}
                        onChange={ev => dispatch(setDevMode(ev.target.checked))}
                    />
                }
                label={t("pages.settings.dev-mode-toggle")}
            />
        </>
    );
};

export default Settings;
