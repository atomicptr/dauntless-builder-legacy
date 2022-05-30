import { Box, Card, CardActionArea, CardContent, CardMedia, Typography } from "@mui/material";
import React from "react";
import { useTranslation } from "react-i18next";

import { ItemType } from "../../data/ItemType";
import { Weapon } from "../../data/Weapon";
import { itemTranslationIdentifier } from "../../utils/item-translation-identifier";
import { itemPickerDefaultImageSize } from "../theme/theme";
import PerksText from "./PerksText";

interface BondWeaponPickerProps {
    parentWeapon: Weapon | null;
    parentWeaponPowerSurged?: boolean;
    bondWeapon: Weapon | null;
    onClick: () => void;
}

const imageSize = itemPickerDefaultImageSize;

const BondWeaponPicker: React.FC<BondWeaponPickerProps> = ({
    parentWeapon,
    parentWeaponPowerSurged,
    bondWeapon,
    onClick,
}) => {
    const { t } = useTranslation();

    if (parentWeapon === null) {
        return null;
    }

    if (!parentWeapon.bond) {
        return null;
    }

    if (bondWeapon === null) {
        return (
            <Card sx={{ mb: 1 }}>
                <CardActionArea
                    sx={{ display: "flex", justifyContent: "flex-start" }}
                    onClick={() => onClick()}>
                    <Box sx={{ alignItems: "center", display: "flex", justifyContent: "center", p: 2 }}>
                        <CardMedia
                            component="img"
                            sx={{ height: imageSize, width: imageSize }}
                            image={"/assets/noicon.png" /* TODO: add generic type icon */}
                        />
                    </Box>
                    <Box>
                        <Typography
                            component="div"
                            variant="h5"
                            sx={{ mb: 1 }}>
                            <span
                                dangerouslySetInnerHTML={{
                                    __html: t("pages.build.no-x-selected", { name: t("terms.bond-weapon") }),
                                }}></span>
                        </Typography>
                        <Typography
                            variant="subtitle1"
                            color="text.secondary"
                            component="div">
                            {t("pages.build.click-here-to-select")}
                        </Typography>
                    </Box>
                </CardActionArea>
            </Card>
        );
    }

    return (
        <Card sx={{ mb: 1, userSelect: "none", width: "100%" }}>
            <CardActionArea
                sx={{ display: "flex", justifyContent: "flex-start" }}
                onClick={() => onClick()}>
                <Box sx={{ alignItems: "center", display: "flex", justifyContent: "center", p: 2 }}>
                    <CardMedia
                        component="img"
                        sx={{ height: imageSize, width: imageSize }}
                        image={bondWeapon.icon ?? "/assets/noicon.png"}
                        alt={t(itemTranslationIdentifier(ItemType.Weapon, bondWeapon.name, "name"))}
                    />
                </Box>
                <Box sx={{ display: "flex", flexDirection: "column" }}>
                    <CardContent sx={{ flex: "1 0 auto" }}>
                        <Box
                            display="flex"
                            alignItems="center">
                            <Typography
                                component="div"
                                variant="h5"
                                sx={{ alignItems: "center", display: "flex", mb: 1 }}>
                                {t(itemTranslationIdentifier(ItemType.Weapon, bondWeapon.name, "name"))}
                            </Typography>
                        </Box>
                        {(bondWeapon.perks ?? []).length > 0 ? (
                            <Typography
                                variant="subtitle1"
                                color="text.secondary"
                                component="div">
                                <PerksText
                                    perks={bondWeapon.perks ?? []}
                                    itemSurged={parentWeaponPowerSurged}
                                />
                            </Typography>
                        ) : null}
                    </CardContent>
                </Box>
            </CardActionArea>
        </Card>
    );
};

export default BondWeaponPicker;
