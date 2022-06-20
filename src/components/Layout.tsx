import {
    AddCircle,
    Bookmarks,
    Build,
    ChevronLeft,
    ChevronRight,
    Home,
    Info,
    ManageSearch,
    Menu,
    Settings,
    Stars,
} from "@mui/icons-material";
import {
    Alert,
    Box,
    Button,
    Chip,
    Container,
    CssBaseline,
    Divider,
    Drawer,
    IconButton,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Toolbar,
    Typography,
    useTheme,
} from "@mui/material";
import BuildMenu from "@src/components/BuildMenu";
import DevMenu from "@src/components/DevMenu";
import { drawerWidth } from "@src/components/theme";
import { discordServerUrl, githubUrl, issuesUrl, matrixChannelUrl, translationDocumentationUrl } from "@src/constants";
import dauntlessBuilderData from "@src/data/Data";
import { selectConfiguration } from "@src/features/configuration/configuration-slice";
import { selectFavorites } from "@src/features/favorites/favorites-slice";
import useIsMobile from "@src/hooks/is-mobile";
import { useAppSelector } from "@src/hooks/redux";
import { currentLanguage, getNativeLanguageName, isBetaLanguage, Language } from "@src/i18n";
import React, { ReactNode, useState } from "react";
import { useTranslation } from "react-i18next";
import { SiMatrix } from "react-icons/all";
import { FaDiscord, FaGithub } from "react-icons/fa";
import { NavLink } from "react-router-dom";

import { AppBar } from "./AppBar";
import { DrawerHeader } from "./Drawer";

interface LayoutProps {
    children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
    const theme = useTheme();
    const isMobile = useIsMobile();
    const [open, setOpen] = useState(false);
    const { t } = useTranslation();
    const configuration = useAppSelector(selectConfiguration);

    const handleDrawerOpen = () => setOpen(true);
    const handleDrawerClose = () => setOpen(false);

    const favorites = useAppSelector(selectFavorites);

    const sidebarItems = [
        { icon: <Home />, link: "/", text: t("drawer.home") },
        { icon: <AddCircle />, link: "/b/new", text: t("drawer.new-build") },
        { disabled: favorites.length === 0, icon: <Bookmarks />, link: "/favorites", text: t("drawer.my-builds") },
        { disabled: true, icon: <ManageSearch />, link: "/b/search", text: t("drawer.build-finder") },
        { disabled: true, icon: <Stars />, link: "/b/meta", text: t("drawer.meta-builds") },
        { icon: <Info />, link: "/about", text: t("drawer.about") },
        { icon: <Settings />, link: "/settings", text: t("drawer.settings") },
    ];

    return (
        <Box sx={{ display: "flex" }}>
            <CssBaseline />
            <AppBar
                isMobile={isMobile}
                open={open}
                position="fixed"
            >
                <Toolbar>
                    {isMobile ? (
                        <IconButton
                            aria-label="open drawer"
                            color="inherit"
                            edge="start"
                            onClick={handleDrawerOpen}
                            sx={{ mr: 2, ...(open && { display: "none" }) }}
                        >
                            <Menu />
                        </IconButton>
                    ) : null}

                    <Box sx={{ alignItems: "center", display: "flex", justifyContent: "center", mr: 2 }}>
                        <img
                            alt={t("app-name")}
                            src="/assets/icon.png"
                            style={{
                                height: 36,
                                userSelect: "none",
                                width: 36,
                            }}
                        />
                    </Box>

                    <Typography
                        component="div"
                        noWrap
                        sx={{ userSelect: "none" }}
                        variant="h6"
                    >
                        {t("app-name")}
                    </Typography>

                    {configuration.devMode ? (
                        <Chip
                            color="error"
                            icon={<Build />}
                            label="Dev Mode"
                            size="small"
                            sx={{ ml: 1 }}
                            variant="outlined"
                        />
                    ) : null}

                    <Box sx={{ flexGrow: 1 }}>{/* Spacer */}</Box>

                    <BuildMenu />
                    <DevMenu />
                </Toolbar>
            </AppBar>
            <Drawer
                anchor="left"
                open={open}
                sx={{
                    "& .MuiDrawer-paper": {
                        boxSizing: "border-box",
                        width: drawerWidth,
                    },
                    flexShrink: 0,
                    width: drawerWidth,
                }}
                variant={isMobile ? "temporary" : "permanent"}
            >
                {isMobile ? (
                    <DrawerHeader>
                        <IconButton onClick={handleDrawerClose}>
                            {theme.direction === "ltr" ? <ChevronLeft /> : <ChevronRight />}
                        </IconButton>
                    </DrawerHeader>
                ) : (
                    <Toolbar />
                )}
                <List>
                    {sidebarItems.map(item => (
                        <ListItem
                            key={item.link}
                            disablePadding
                        >
                            <ListItemButton
                                component={NavLink}
                                disabled={item.disabled}
                                onClick={isMobile ? handleDrawerClose : undefined}
                                title={item.disabled ? "coming soon..." : undefined}
                                to={item.link}
                            >
                                <ListItemIcon>{item.icon}</ListItemIcon>
                                <ListItemText primary={item.text} />
                            </ListItemButton>
                        </ListItem>
                    ))}
                </List>
                <Box
                    sx={{
                        bottom: 0,
                        marginTop: "auto",
                        pb: 0,
                        position: "fixed",
                        textAlign: "center",
                        width: drawerWidth,
                    }}
                >
                    <Button
                        component={"a"}
                        href={t("misc.patch-url", { version: dauntlessBuilderData.misc.patchnotes_version_string })}
                        target="_blank"
                    >
                        {t("misc.dauntless-version", { version: dauntlessBuilderData.misc.dauntless_version })}
                    </Button>
                    <List sx={{ marginTop: "auto" }}>
                        <Divider />
                        <ListItem
                            style={{
                                display: "flex",
                                justifyContent: "center",
                            }}
                        >
                            <IconButton
                                component="a"
                                href={githubUrl}
                                target="_blank"
                                title={t("misc.github-repository")}
                            >
                                <FaGithub />
                            </IconButton>
                            <IconButton
                                component="a"
                                href={matrixChannelUrl}
                                target="_blank"
                                title={t("misc.matrix-channel")}
                            >
                                <SiMatrix />
                            </IconButton>
                            <IconButton
                                component="a"
                                href={discordServerUrl}
                                target="_blank"
                                title={t("misc.discord-server")}
                            >
                                <FaDiscord />
                            </IconButton>
                        </ListItem>
                    </List>
                </Box>
            </Drawer>
            <Container maxWidth={"xl"}>
                <DrawerHeader sx={{ marginBottom: "16px" }} />

                <Alert
                    severity="warning"
                    sx={{ mb: 2 }}
                >
                    <div
                        dangerouslySetInnerHTML={{
                            __html: t("alert.alpha-version", {
                                discordServerUrl,
                                issuesUrl,
                                matrixChannelUrl,
                            }),
                        }}
                    />
                </Alert>

                {isBetaLanguage(currentLanguage()) ? (
                    <Alert
                        severity="warning"
                        sx={{ mb: 2 }}
                    >
                        <div
                            dangerouslySetInnerHTML={{
                                __html: t("alert.translation-warning", {
                                    languageName: getNativeLanguageName(currentLanguage() as Language),
                                    translationDocumentationUrl,
                                }),
                            }}
                        />
                    </Alert>
                ) : null}

                {children}
            </Container>
        </Box>
    );
};

export default Layout;
