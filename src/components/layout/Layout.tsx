import React, { ReactNode, useState } from "react";
import {
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
    useMediaQuery,
    useTheme,
} from "@mui/material";
import { drawerWidth } from "../theme/theme";
import { NavLink } from "react-router-dom";
import { AppBar } from "./AppBar";
import { DrawerHeader } from "./Drawer";
import { FaDiscord, FaGithub } from "react-icons/fa";
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
import { useTranslation } from "react-i18next";
import DevMenu from "../dev-menu/DevMenu";

interface LayoutProps {
    children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
    const theme = useTheme();
    const isMobile = useMediaQuery("(max-width: 760px)");
    const [open, setOpen] = useState(false);
    const { t } = useTranslation();

    const handleDrawerOpen = () => setOpen(true);
    const handleDrawerClose = () => setOpen(false);

    const sidebarItems = [
        { text: t("drawer.home"), icon: <Home />, link: "/" },
        { text: t("drawer.new-build"), icon: <AddCircle />, link: "/b/new" },
        { text: t("drawer.my-builds"), icon: <Bookmarks />, link: "/favorites" },
        { text: t("drawer.build-search"), icon: <ManageSearch />, link: "/b/search", disabled: true },
        { text: t("drawer.meta-builds"), icon: <Stars />, link: "/b/meta", disabled: true },
        { text: t("drawer.settings"), icon: <Settings />, link: "/settings" },
    ];

    return (
        <Box sx={{ display: "flex" }}>
            <CssBaseline />
            <AppBar position="fixed" open={open} isMobile={isMobile}>
                <Toolbar>
                    {isMobile ? (
                        <IconButton
                            color="inherit"
                            aria-label="open drawer"
                            onClick={handleDrawerOpen}
                            edge="start"
                            sx={{ mr: 2, ...(open && { display: "none" }) }}
                        >
                            <Menu />
                        </IconButton>
                    ) : null}

                    <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", mr: 2 }}>
                        <img
                            alt="Dauntless Builder"
                            src="/assets/icon.png"
                            style={{
                                width: 36,
                                height: 36,
                                userSelect: "none",
                                filter: theme.palette.mode === "dark" ? "invert(100%)" : undefined,
                            }}
                        />
                    </Box>

                    <Typography variant="h6" noWrap component="div" sx={{ userSelect: "none" }}>
                        Dauntless Builder
                    </Typography>

                    <Box sx={{ flexGrow: 1 }}>{/* Spacer */}</Box>

                    <DevMenu />
                </Toolbar>
            </AppBar>
            <Drawer
                sx={{
                    width: drawerWidth,
                    flexShrink: 0,
                    "& .MuiDrawer-paper": {
                        width: drawerWidth,
                        boxSizing: "border-box",
                    },
                }}
                variant={isMobile ? "temporary" : "permanent"}
                anchor="left"
                open={open}
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
                        <ListItem key={item.link} disablePadding>
                            <ListItemButton
                                component={NavLink}
                                to={item.link}
                                onClick={isMobile ? handleDrawerClose : undefined}
                                disabled={item.disabled}
                                title={item.disabled ? "coming soon..." : undefined}
                            >
                                <ListItemIcon>{item.icon}</ListItemIcon>
                                <ListItemText primary={item.text} />
                            </ListItemButton>
                        </ListItem>
                    ))}
                </List>
                <Box
                    sx={{
                        position: "fixed",
                        marginTop: "auto",
                        textAlign: "center",
                        width: drawerWidth,
                        pb: 0,
                        bottom: 0,
                    }}
                >
                    <Button component={"a"} target="_blank" href="https://playdauntless.com/patch-notes/1-9-3/">
                        Dauntless v1.9.3
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
                                href="https://github.com/atomicptr/dauntless-builder"
                                target="_blank"
                                title="Github Repository"
                            >
                                <FaGithub />
                            </IconButton>
                            <IconButton
                                component="a"
                                href="https://discord.gg/hkMvhsfPjH"
                                target="_blank"
                                title="Dauntless Builder Discord Server"
                            >
                                <FaDiscord />
                            </IconButton>
                        </ListItem>
                    </List>
                </Box>
            </Drawer>
            <Container maxWidth={"xl"}>
                <DrawerHeader sx={{ marginBottom: "16px" }} />
                {children}
            </Container>
        </Box>
    );
};

export default Layout;
