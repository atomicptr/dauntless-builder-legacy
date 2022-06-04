import { Build } from "@mui/icons-material";
import { IconButton, Menu, MenuItem } from "@mui/material";
import React from "react";
import { useTranslation } from "react-i18next";
import { showTranslations } from "translation-check";

const DevMenu: React.FC = () => {
    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
    const { t, i18n } = useTranslation();

    if (!DB_DEVMODE) {
        return null;
    }

    const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    return (
        <>
            <IconButton
                aria-controls="menu-appbar"
                aria-haspopup="true"
                aria-label="account of current user"
                color="inherit"
                onClick={handleMenu}
                size="large">
                <Build />
            </IconButton>
            <Menu
                anchorEl={anchorEl}
                anchorOrigin={{
                    horizontal: "right",
                    vertical: "bottom",
                }}
                id="dev-menu-appbar"
                keepMounted
                onClose={handleClose}
                open={Boolean(anchorEl)}
                transformOrigin={{
                    horizontal: "right",
                    vertical: "top",
                }}>
                <MenuItem
                    onClick={() => showTranslations(i18n)}>{t("appbar.dev-menu.translation-check")}
                </MenuItem>
            </Menu>
        </>
    );
};

export default DevMenu;
