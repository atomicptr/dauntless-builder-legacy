import { Build } from "@mui/icons-material";
import {
    Card,
    CardContent,
    FormControl,
    InputLabel,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    ListSubheader,
    MenuItem,
    Select,
    Switch,
} from "@mui/material";
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

            <ListSubheader sx={{ mt: 2 }}>{t("pages.settings.general")}</ListSubheader>
            <Card>
                <CardContent>
                    <FormControl
                        fullWidth
                        sx={{ mt: 1 }}
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
                </CardContent>
            </Card>

            <ListSubheader>{t("pages.settings.misc")}</ListSubheader>
            <Card>
                <CardContent>
                    <List sx={{ p: 0 }}>
                        <ListItem>
                            <ListItemIcon>
                                <Build />
                            </ListItemIcon>
                            <ListItemText primary={t("pages.settings.dev-mode-toggle")} />
                            <Switch
                                checked={configuration.devMode}
                                disabled={DB_DEVMODE}
                                onChange={ev => dispatch(setDevMode(ev.target.checked))}
                            />
                        </ListItem>
                    </List>
                </CardContent>
            </Card>
        </>
    );
};

export default Settings;
