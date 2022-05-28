import { createTheme } from "@mui/material";

import { muiLocaleComponent } from "../../i18n";

export const drawerWidth = 240;

const baseTheme = createTheme({
    palette: {
        mode: "dark",
        primary: {
            main: "#3f51b5",
        },
        secondary: {
            main: "#f50057",
        },
    },
});

const makeTheme = () => {
    return createTheme(baseTheme, muiLocaleComponent());
};

const theme = makeTheme();

export default theme;
