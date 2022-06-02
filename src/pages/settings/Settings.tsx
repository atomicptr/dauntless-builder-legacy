import { FormControl, InputLabel, MenuItem, Select } from "@mui/material";
import React from "react";
import { useTranslation } from "react-i18next";

import PageTitle from "../../components/page-title/PageTitle";
import { getNativeLanguageName, Language } from "../../i18n";

const Settings: React.FC = () => {
    const { t, i18n } = useTranslation();

    return (
        <>
            <PageTitle
                title={t("pages.settings.title")} />

            <FormControl
                fullWidth
                sx={{ mt: 4 }}>
                <InputLabel>{t("pages.settings.language")}</InputLabel>
                <Select
                    label={t("pages.settings.language")}
                    onChange={ev => i18n.changeLanguage(ev.target.value)}
                    value={i18n.languages[0]}>
                    {Object.keys(Language).map((key: string) => (
                        <MenuItem
                            key={key}
                            value={Language[key as keyof typeof Language]}>
                            {getNativeLanguageName(Language[key as keyof typeof Language]) !== null
                                ? `${getNativeLanguageName(Language[key as keyof typeof Language])} (${key})`
                                : key}
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>
        </>
    );
};

export default Settings;
