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
    Shield,
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
import AdSpace from "@src/components/AdSpace";
import AdSpaceFloating, { adSpaceRightSideMinSize } from "@src/components/AdSpaceFloating";
import BuildMenu from "@src/components/BuildMenu";
import LinkBox from "@src/components/LinkBox";
import Spacer from "@src/components/Spacer";
import { drawerWidth } from "@src/components/theme";
import { crowdinLink, discordServerUrl, githubUrl, xTwitterUrl } from "@src/constants";
import Tracking from "@src/components/Tracking";
import dauntlessBuilderData from "@src/data/Data";
import useDevMode from "@src/hooks/dev-mode";
import useIsMobile from "@src/hooks/is-mobile";
import { currentLanguage, getNativeLanguageName, isBetaLanguage, Language } from "@src/i18n";
import { favoritesView } from "@src/state/favorites";
import useWindowSize from "@src/hooks/window-size";
import log from "@src/utils/logger";
import { useAtomValue } from "jotai";
import React, { ReactNode, useState } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { useTranslation } from "react-i18next";
import { FaDiscord, FaGithub } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import { NavLink } from "react-router-dom";

import { AppBar } from "./AppBar";
import { DrawerHeader } from "./Drawer";
import SomethingWentWrong from "./SomethingWentWrong";

interface LayoutProps {
    children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
    const theme = useTheme();

    const isMobile = useIsMobile();
    const { width } = useWindowSize();
    const [open, setOpen] = useState(false);
    const { t } = useTranslation();
    const devMode = useDevMode();

    const handleDrawerOpen = () => setOpen(true);
    const handleDrawerClose = () => setOpen(false);

    const favorites = useAtomValue(favoritesView);

    const sidebarItems = [
        { icon: <Home />, link: "/", text: t("drawer.home") },
        { icon: <AddCircle />, link: "/b/new", text: t("drawer.new-build") },
        { disabled: favorites.length === 0, icon: <Bookmarks />, link: "/favorites", text: t("drawer.my-builds") },
        { icon: <ManageSearch />, link: "/b/finder", text: t("drawer.build-finder") },
        { icon: <Stars />, link: "/b/meta", text: t("drawer.meta-builds") },
        { icon: <Info />, link: "/about", text: t("drawer.about") },
        { icon: <Shield />, link: "/privacy", text: t("drawer.privacy") },
        { icon: <Settings />, link: "/settings", text: t("drawer.settings") },
    ];

    const showLeftSideAdSpace = (width - theme.breakpoints.values.xl) * 0.5 <= adSpaceRightSideMinSize;

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
                            src={"/assets/icon.png"}
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

                    {devMode ? (
                        <Chip
                            color="error"
                            icon={<Build />}
                            label="Dev Mode"
                            size="small"
                            sx={{ ml: 1, userSelect: "none" }}
                            variant="outlined"
                        />
                    ) : null}

                    <Box sx={{ flexGrow: 1 }}>{/* Spacer */}</Box>

                    <BuildMenu />
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

                {isMobile ? <Spacer /> : showLeftSideAdSpace ? <AdSpace /> : <Spacer />}

                <Box
                    sx={{
                        marginTop: 1,
                        pb: 0,
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
                                href={discordServerUrl}
                                target="_blank"
                                title={t("misc.discord-server")}
                            >
                                <FaDiscord />
                            </IconButton>
                            <IconButton
                                component="a"
                                href={xTwitterUrl}
                                target="_blank"
                                title={t("misc.x-twitter")}
                            >
                                <FaXTwitter />
                            </IconButton>
                        </ListItem>
                    </List>
                </Box>
            </Drawer>
            <Container maxWidth={"xl"}>
                <DrawerHeader sx={{ marginBottom: "16px" }} />

                {isBetaLanguage(currentLanguage()) ? (
                    <Alert
                        severity="warning"
                        sx={{ mb: 2 }}
                    >
                        <LinkBox
                            text={t("alert.translation-warning", {
                                crowdinLink,
                                languageName: getNativeLanguageName(currentLanguage() as Language),
                            })}
                        />
                    </Alert>
                ) : null}

                <ErrorBoundary
                    FallbackComponent={SomethingWentWrong}
                    onError={(e, info) => log.error(e.message, { info })}
                >
                    <Box>{children}</Box>
                </ErrorBoundary>
            </Container>

            <Tracking />
            <AdSpaceFloating />
        </Box>
    );
};

export default Layout;
