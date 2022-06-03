import {
    AddCircle,
    Bookmarks,
    ChevronLeft,
    ChevronRight,
    Home,
    ManageSearch,
    Menu,
    Settings,
    Stars,
} from "@mui/icons-material";
import {
    Alert,
    Box,
    Button,
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
import DevMenu from "@src/components/dev-menu/DevMenu";
import { drawerWidth } from "@src/components/theme/theme";
import dauntlessBuilderData from "@src/data/Data";
import useIsMobile from "@src/hooks/is-mobile";
import { getNativeLanguageName, Language } from "@src/i18n";
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
    const { t, i18n } = useTranslation();

    const handleDrawerOpen = () => setOpen(true);
    const handleDrawerClose = () => setOpen(false);

    const sidebarItems = [
        { icon: <Home />, link: "/", text: t("drawer.home") },
        { disabled: true, icon: <AddCircle />, link: "/b/new", text: t("drawer.new-build") },
        { disabled: true, icon: <Bookmarks />, link: "/favorites", text: t("drawer.my-builds") },
        { disabled: true, icon: <ManageSearch />, link: "/b/search", text: t("drawer.build-finder") },
        { disabled: true, icon: <Stars />, link: "/b/meta", text: t("drawer.meta-builds") },
        { icon: <Settings />, link: "/settings", text: t("drawer.settings") },
    ];

    return (
        <Box
            sx={{ display: "flex" }}>
            <CssBaseline />
            <AppBar
                isMobile={isMobile}
                open={open}
                position="fixed">
                <Toolbar>
                    {isMobile ? (
                        <IconButton
                            aria-label="open drawer"
                            color="inherit"
                            edge="start"
                            onClick={handleDrawerOpen}
                            sx={{ mr: 2, ...(open && { display: "none" }) }}>
                            <Menu />
                        </IconButton>
                    ) : null}

                    <Box
                        sx={{ alignItems: "center", display: "flex", justifyContent: "center", mr: 2 }}>
                        <img
                            alt="Dauntless Builder"
                            src="/assets/icon.png"
                            style={{
                                height: 36,
                                userSelect: "none",
                                width: 36,
                            }} />
                    </Box>

                    <Typography
                        component="div"
                        noWrap
                        sx={{ userSelect: "none" }}
                        variant="h6">
                        Dauntless Builder
                    </Typography>

                    <Box
                        sx={{ flexGrow: 1 }}>{/* Spacer */}
                    </Box>

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
                variant={isMobile ? "temporary" : "permanent"}>
                {isMobile ? (
                    <DrawerHeader>
                        <IconButton
                            onClick={handleDrawerClose}>
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
                            disablePadding>
                            <ListItemButton
                                component={NavLink}
                                disabled={item.disabled}
                                onClick={isMobile ? handleDrawerClose : undefined}
                                title={item.disabled ? "coming soon..." : undefined}
                                to={item.link}>
                                <ListItemIcon>{item.icon}</ListItemIcon>
                                <ListItemText
                                    primary={item.text} />
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
                    }}>
                    <Button
                        component={"a"}
                        href={`https://playdauntless.com/patch-notes/${dauntlessBuilderData.misc.patchnotes_version_string}/`}
                        target="_blank">
                        Dauntless v{dauntlessBuilderData.misc.dauntless_version}
                    </Button>
                    <List
                        sx={{ marginTop: "auto" }}>
                        <Divider />
                        <ListItem
                            style={{
                                display: "flex",
                                justifyContent: "center",
                            }}>
                            <IconButton
                                component="a"
                                href="https://github.com/atomicptr/dauntless-builder"
                                target="_blank"
                                title="Github Repository">
                                <FaGithub />
                            </IconButton>
                            <IconButton
                                component="a"
                                href="https://matrix.to/#/#dauntlessbuilder:matrix.org"
                                target="_blank"
                                title="Dauntless Builder Matrix Server">
                                <SiMatrix />
                            </IconButton>
                            <IconButton
                                component="a"
                                href="https://discord.gg/hkMvhsfPjH"
                                target="_blank"
                                title="Dauntless Builder Discord Server">
                                <FaDiscord />
                            </IconButton>
                        </ListItem>
                    </List>
                </Box>
            </Drawer>
            <Container
                maxWidth={"xl"}>
                <DrawerHeader
                    sx={{ marginBottom: "16px" }} />

                {i18n.languages[0] !== Language.English ? (
                    <Alert
                        severity="warning"
                        sx={{ mb: 2 }}>
                        <div
                            dangerouslySetInnerHTML={{
                                __html: t("alert.translation-warning", {
                                    languageName: getNativeLanguageName(i18n.languages[0] as Language),
                                }),
                            }}>
                        </div>
                    </Alert>
                ) : null}

                {children}
            </Container>
        </Box>
    );
};

export default Layout;
