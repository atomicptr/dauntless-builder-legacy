import {
    Brightness7,
    Build,
    CloudDownload,
    CloudUpload,
    Download,
    People,
    Search,
    TableRows,
    Translate,
} from "@mui/icons-material";
import {
    Box,
    Button,
    Card,
    CardActions,
    CardContent,
    FormControl,
    IconButton,
    InputLabel,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    ListSubheader,
    MenuItem,
    Select,
    Stack,
    Switch,
    Tooltip,
} from "@mui/material";
import PageTitle from "@src/components/PageTitle";
import useIsMobile from "@src/hooks/is-mobile";
import { currentLanguage, flagCode, getNativeLanguageName, isCommunityLanguage, Language } from "@src/i18n";
import {
    configurationAtom,
    setDevMode,
    setFinderPerkMatching,
    setLanguage,
    setLightModeEnabled,
} from "@src/state/configuration";
import { exportState, persistState } from "@src/store";
import { downloadJsonObject } from "@src/utils/download-json";
import log, { Logger } from "@src/utils/logger";
import { useAtomValue, useSetAtom } from "jotai";
import React from "react";
import ReactCountryFlag from "react-country-flag";
import { useTranslation } from "react-i18next";

const Settings: React.FC = () => {
    const { t } = useTranslation();
    const isMobile = useIsMobile();
    const configuration = useAtomValue(configurationAtom);
    const setConfiguration = useSetAtom(configurationAtom);

    const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;

        if (files === null || files.length !== 1) {
            log.error("Something went wrong while trying to upload files", { files });
            return;
        }

        const file = files[0];

        const reader = new FileReader();
        reader.onload = e => {
            const data = e.target?.result ?? null;

            if (data === null) {
                log.error("Could not read file", { file });
                return;
            }

            const match = /^data:(.*);base64,(.*)$/.exec(data.toString());

            if (match === null || match?.length !== 3) {
                log.error("Could not parse file", { file });
                return;
            }

            const mimeType = match[1];

            if (mimeType !== "application/json") {
                log.error("Unknown file type", { file, mimeType });
                return;
            }

            const content = match[2];

            try {
                const state = JSON.parse(window.atob(content));
                persistState(state);
                window.location.reload();
            } catch (err) {
                log.error("Could not restore state", { err });
            }
        };
        reader.readAsDataURL(file);
    };

    return (
        <>
            <PageTitle title={t("pages.settings.title")} />

            <ListSubheader sx={{ mt: 2 }}>{t("pages.settings.general")}</ListSubheader>
            <Card>
                <CardContent>
                    <List sx={{ p: 0 }}>
                        <ListItem>
                            {!isMobile ? (
                                <>
                                    <ListItemIcon>
                                        <Translate />
                                    </ListItemIcon>
                                    <ListItemText primary={t("pages.settings.language")} />
                                </>
                            ) : null}
                            <FormControl sx={{ width: isMobile ? "100%" : "50%" }}>
                                <InputLabel>{t("pages.settings.language")}</InputLabel>
                                <Select
                                    label={t("pages.settings.language")}
                                    onChange={ev => setConfiguration(setLanguage(ev.target.value as Language))}
                                    value={currentLanguage()}
                                >
                                    {Object.keys(Language).map((key: string) => (
                                        <MenuItem
                                            key={key}
                                            value={Language[key as keyof typeof Language]}
                                        >
                                            <Stack
                                                alignItems="center"
                                                direction="row"
                                                spacing={1}
                                            >
                                                <ReactCountryFlag
                                                    countryCode={flagCode(Language[key as keyof typeof Language])}
                                                />
                                                <Box>
                                                    {getNativeLanguageName(Language[key as keyof typeof Language]) !==
                                                    null
                                                        ? `${getNativeLanguageName(
                                                            Language[key as keyof typeof Language],
                                                        )} (${key})`
                                                        : key}
                                                </Box>
                                                {isCommunityLanguage(Language[key as keyof typeof Language]) && (
                                                    <Tooltip title={t("pages.settings.community-language")}>
                                                        <People />
                                                    </Tooltip>
                                                )}
                                            </Stack>
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </ListItem>
                        <ListItem>
                            <ListItemIcon>
                                <Brightness7 />
                            </ListItemIcon>
                            <ListItemText primary={t("pages.settings.enable-light-mode")} />
                            <Switch
                                checked={configuration.lightModeEnabled}
                                onChange={ev => setConfiguration(setLightModeEnabled(ev.target.checked))}
                            />
                        </ListItem>
                    </List>
                </CardContent>
            </Card>

            <ListSubheader>{t("pages.settings.data")}</ListSubheader>
            <Card>
                <CardContent>{t("pages.settings.data-text")}</CardContent>
                <CardActions>
                    <Box sx={{ flexGrow: 10 }} />
                    <Button
                        component="label"
                        startIcon={<CloudUpload />}
                    >
                        {t("pages.settings.data-import")}
                        <input
                            accept="application/json"
                            hidden
                            id="data-import-input"
                            onChange={handleFileImport}
                            type="file"
                        />
                    </Button>
                    <Button
                        startIcon={<CloudDownload />}
                        {...downloadJsonObject(exportState(), "dauntless-builder-data-export")}
                    >
                        {t("pages.settings.data-export")}
                    </Button>
                </CardActions>
            </Card>

            <ListSubheader>{t("pages.settings.finder-options")}</ListSubheader>
            <Card>
                <CardContent>
                    <List sx={{ p: 0 }}>
                        <ListItem>
                            <ListItemIcon>
                                <Search />
                            </ListItemIcon>
                            <ListItemText primary={t("pages.build-finder.perk-matching-enabled")} />
                            <Switch
                                checked={configuration.finderPerkMatchingEnabled}
                                onChange={ev => setConfiguration(setFinderPerkMatching(ev.target.checked))}
                            />
                        </ListItem>
                    </List>
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
                                onChange={ev => setConfiguration(setDevMode(ev.target.checked))}
                            />
                        </ListItem>
                        <ListItem>
                            <ListItemIcon>
                                <TableRows />
                            </ListItemIcon>
                            <ListItemText primary={t("pages.settings.export-logs")} />
                            <IconButton {...downloadJsonObject(Logger.data(), "dauntless-builder-logs")}>
                                <Download />
                            </IconButton>
                        </ListItem>
                    </List>
                </CardContent>
            </Card>
        </>
    );
};

export default Settings;
