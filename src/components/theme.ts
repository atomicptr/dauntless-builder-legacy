import { createTheme, PaletteColor } from "@mui/material";
import { ItemRarity } from "@src/data/ItemRarity";
import { muiLocaleComponent } from "@src/i18n";

export const drawerWidth = 240;
export const itemPickerDefaultImageSize = 64;

const baseTheme = createTheme({
    palette: {
        mode: "dark",
    },
});

export const rarityColor: { [key in ItemRarity]: PaletteColor } = {
    [ItemRarity.Exotic]: baseTheme.palette.augmentColor({ color: { main: "#ff8f00" } }),
    [ItemRarity.Epic]: baseTheme.palette.augmentColor({ color: { main: "#BA00FF" } }),
    [ItemRarity.Rare]: baseTheme.palette.augmentColor({ color: { main: "#0072EB" } }),
    [ItemRarity.Uncommon]: baseTheme.palette.augmentColor({ color: { main: "#00CA3C" } }),
};

export const makeTheme = (mode: "dark" | "light") => {
    return createTheme(
        baseTheme,
        createTheme({
            palette: {
                mode,
            },
        }),
        muiLocaleComponent(),
    );
};
