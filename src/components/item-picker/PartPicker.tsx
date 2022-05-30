import { Box, Card, CardActionArea, CardContent, CardMedia, Typography } from "@mui/material";
import React from "react";
import { useTranslation } from "react-i18next";
import { match } from "ts-pattern";

import { Part, PartType } from "../../data/Part";
import { WeaponType } from "../../data/Weapon";
import { partsTranslationIdentifier } from "../../utils/item-translation-identifier";
import { itemPickerDefaultImageSize } from "../theme/theme";

interface PartPickerProps {
    type: PartType;
    item: Part | null;
    weaponType: WeaponType | null;
    onClick: (partType: PartType) => void;
}

const imageSize = itemPickerDefaultImageSize;

const PartPicker: React.FC<PartPickerProps> = ({ type, item, weaponType, onClick }) => {
    const { t } = useTranslation();

    const partTypeName = (partType: PartType): string =>
        match(partType)
            .with(PartType.Mod, () => t("terms.parts.mod"))
            .with(PartType.Special, () => t("terms.parts.special"))
            .with(PartType.Chamber, () => t("terms.parts.chamber"))
            .with(PartType.Grip, () => t("terms.parts.grip"))
            .run();

    if (weaponType === null) {
        return null;
    }

    if (item === null) {
        return (
            <Card sx={{ mb: 1 }}>
                <CardActionArea
                    sx={{ display: "flex", justifyContent: "flex-start" }}
                    onClick={() => onClick(type)}>
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
                                    __html: t("pages.build.no-x-selected", { name: partTypeName(type) }),
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
                onClick={() => onClick(type)}>
                <Box sx={{ alignItems: "center", display: "flex", justifyContent: "center", p: 2 }}>
                    <CardMedia
                        component="img"
                        sx={{ height: imageSize, width: imageSize }}
                        image={item.icon ?? "/assets/noicon.png"}
                        alt={t(partsTranslationIdentifier(weaponType, type, item.name, "name"))}
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
                                {t(partsTranslationIdentifier(weaponType, type, item.name, "name"))}
                            </Typography>
                        </Box>
                        {item.part_effect.map((pe, index) => (
                            <Typography
                                key={index}
                                variant="subtitle1"
                                color="text.secondary"
                                component="div">
                                {t(
                                    partsTranslationIdentifier(
                                        weaponType,
                                        type,
                                        item.name,
                                        "part_effect",
                                        index.toString(),
                                    ),
                                )}
                            </Typography>
                        ))}
                    </CardContent>
                </Box>
            </CardActionArea>
        </Card>
    );
};

export default PartPicker;
