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
            <Card
                sx={{ mb: 1 }}>
                <CardActionArea
                    onClick={() => onClick()}
                    sx={{ display: "flex", justifyContent: "flex-start" }}>
                    <Box
                        sx={{ alignItems: "center", display: "flex", justifyContent: "center", p: 2 }}>
                        <CardMedia
                            component="img"
                            image={"/assets/noicon.png" /* TODO: add generic type icon */}
                            sx={{ height: imageSize, width: imageSize }} />
                    </Box>
                    <Box>
                        <Typography
                            component="div"
                            sx={{ mb: 1 }}
                            variant="h5">
                            <span
                                dangerouslySetInnerHTML={{
                                    __html: t("pages.build.no-x-selected", { name: t("terms.bond-weapon") }),
                                }}>
                            </span>
                        </Typography>
                        <Typography
                            color="text.secondary"
                            component="div"
                            variant="subtitle1">
                            {t("pages.build.click-here-to-select")}
                        </Typography>
                    </Box>
                </CardActionArea>
            </Card>
        );
    }

    return (
        <Card
            sx={{ mb: 1, userSelect: "none", width: "100%" }}>
            <CardActionArea
                onClick={() => onClick()}
                sx={{ display: "flex", justifyContent: "flex-start" }}>
                <Box
                    sx={{ alignItems: "center", display: "flex", justifyContent: "center", p: 2 }}>
                    <CardMedia
                        alt={t(itemTranslationIdentifier(ItemType.Weapon, bondWeapon.name, "name"))}
                        component="img"
                        image={bondWeapon.icon ?? "/assets/noicon.png"}
                        sx={{ height: imageSize, width: imageSize }} />
                </Box>
                <Box
                    sx={{ display: "flex", flexDirection: "column" }}>
                    <CardContent
                        sx={{ flex: "1 0 auto" }}>
                        <Box
                            alignItems="center"
                            display="flex">
                            <Typography
                                component="div"
                                sx={{ alignItems: "center", display: "flex", mb: 1 }}
                                variant="h5">
                                {t(itemTranslationIdentifier(ItemType.Weapon, bondWeapon.name, "name"))}
                            </Typography>
                        </Box>
                        {(bondWeapon.perks ?? []).length > 0 ? (
                            <Typography
                                color="text.secondary"
                                component="div"
                                variant="subtitle1">
                                <PerksText
                                    itemSurged={parentWeaponPowerSurged}
                                    perks={bondWeapon.perks ?? []} />
                            </Typography>
                        ) : null}
                    </CardContent>
                </Box>
            </CardActionArea>
        </Card>
    );
};

export default BondWeaponPicker;
