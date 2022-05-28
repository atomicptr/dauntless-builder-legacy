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
    transition: theme.transitions.create(["margin", "width"], {
        duration: theme.transitions.duration.leavingScreen,
        easing: theme.transitions.easing.sharp,
    }),
    zIndex: isMobile ? theme.zIndex.drawer : theme.zIndex.drawer + 1,
    ...(open && {
        ...(isMobile && {
            marginLeft: `${drawerWidth}px`,
            width: `calc(100% - ${drawerWidth}px)`,
        }),
        transition: theme.transitions.create(["margin", "width"], {
            duration: theme.transitions.duration.enteringScreen,
            easing: theme.transitions.easing.easeOut,
        }),
    }),
}));
