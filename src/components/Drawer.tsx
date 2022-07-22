import { styled } from "@mui/material";
import MuiDrawer from "@mui/material/Drawer";
import { drawerWidth } from "@src/components/theme";

export const DrawerHeader = styled("div")(({ theme }) => ({
    alignItems: "center",
    display: "flex",
    padding: theme.spacing(0, 1),
    // necessary for content to be below app bar
    ...theme.mixins.toolbar,
    justifyContent: "flex-end",
}));

export const Drawer = styled(MuiDrawer, { shouldForwardProp: prop => prop !== "open" })(({ theme, open }) => ({
    "& .MuiDrawer-paper": {
        boxSizing: "border-box",
        position: "relative",
        transition: theme.transitions.create("width", {
            duration: theme.transitions.duration.enteringScreen,
            easing: theme.transitions.easing.sharp,
        }),
        whiteSpace: "nowrap",
        width: drawerWidth,
        ...(!open && {
            overflowX: "hidden",
            transition: theme.transitions.create("width", {
                duration: theme.transitions.duration.leavingScreen,
                easing: theme.transitions.easing.sharp,
            }),
            width: theme.spacing(7),
            [theme.breakpoints.up("sm")]: {
                width: theme.spacing(9),
            },
        }),
    },
}));
