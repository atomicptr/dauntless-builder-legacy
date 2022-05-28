import { Build } from "@mui/icons-material";
import { IconButton, Menu, MenuItem } from "@mui/material";
import React from "react";
import { useTranslation } from "react-i18next";
import { showTranslations } from "translation-check";

const DevMenu: React.FC = () => {
    if (!DB_DEVMODE) {
        return null;
    }

    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
    const { t, i18n } = useTranslation();

    const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    return (
        <>
            <IconButton
                size="large"
                aria-label="account of current user"
                aria-controls="menu-appbar"
                aria-haspopup="true"
                onClick={handleMenu}
                color="inherit"
            >
                <Build />
            </IconButton>
            <Menu
                id="dev-menu-appbar"
                anchorEl={anchorEl}
                anchorOrigin={{
                    vertical: "bottom",
                    horizontal: "right",
                }}
                keepMounted
                transformOrigin={{
                    vertical: "top",
                    horizontal: "right",
                }}
                open={Boolean(anchorEl)}
                onClose={handleClose}
            >
                <MenuItem onClick={() => showTranslations(i18n)}>{t("appbar.dev-menu.translation-check")}</MenuItem>
            </Menu>
        </>
    );
};

export default DevMenu;
