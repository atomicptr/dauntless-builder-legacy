import {FormControl, InputLabel, MenuItem, Select, Typography} from "@mui/material";
import {useTranslation} from "react-i18next";
import {getNativeLanguageName, Language} from "../../i18n";
import React from "react";

const Settings: React.FC = () => {
    const {t, i18n} = useTranslation();

    return <>
        <Typography variant="h5" component="h3">
            {t("pages.settings.title")}
        </Typography>

        <FormControl fullWidth sx={{mt: 4}}>
            <InputLabel>Language</InputLabel>
            <Select value={i18n.languages[0]} label="Language" onChange={ev => i18n.changeLanguage(ev.target.value)}>
                {Object.keys(Language).map((key: string) =>
                    <MenuItem key={key} value={Language[key as keyof typeof Language]}>
                        {getNativeLanguageName(Language[key as keyof typeof Language]) !== null ?
                            `${getNativeLanguageName(Language[key as keyof typeof Language])} (${key})` : key}
                    </MenuItem>)}
            </Select>
        </FormControl>
    </>
};

export default Settings;
