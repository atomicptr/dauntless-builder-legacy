import { AppBar as MuiAppBar, AppBarProps as MuiAppBarProps } from "@mui/material";
import { styled } from "@mui/material/styles";

import { drawerWidth } from "../theme/theme";

interface AppBarProps extends MuiAppBarProps {
    open?: boolean;
    isMobile?: boolean;
}

export const AppBar = styled(MuiAppBar, {
    shouldForwardProp: prop => prop !== "open",
})<AppBarProps>(({ theme, open, isMobile }) => ({
    zIndex: isMobile ? theme.zIndex.drawer : theme.zIndex.drawer + 1,
    transition: theme.transitions.create(["margin", "width"], {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
    }),
    ...(open && {
        ...(isMobile && {
            width: `calc(100% - ${drawerWidth}px)`,
            marginLeft: `${drawerWidth}px`,
        }),
        transition: theme.transitions.create(["margin", "width"], {
            easing: theme.transitions.easing.easeOut,
            duration: theme.transitions.duration.enteringScreen,
        }),
    }),
}));
