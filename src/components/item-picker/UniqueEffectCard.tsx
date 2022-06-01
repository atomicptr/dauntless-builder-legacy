import { Box, Card, CardContent, CardMedia, Typography } from "@mui/material";
import React from "react";
import { useTranslation } from "react-i18next";

import { Armour } from "../../data/Armour";
import { ItemType } from "../../data/ItemType";
import { UniqueEffect } from "../../data/UniqueEffect";
import { Weapon } from "../../data/Weapon";
import { ttry } from "../../i18n";
import { renderItemText } from "../../utils/item-text-renderer";
import { itemTranslationIdentifier } from "../../utils/item-translation-identifier";
import { itemPickerDefaultImageSize } from "../theme/theme";

interface UniqueEffectCardProps {
    index: number;
    uniqueEffect: UniqueEffect;
    item: Weapon | Armour;
    itemType: ItemType;
}

const imageSize = itemPickerDefaultImageSize;

const UniqueEffectCard: React.FC<UniqueEffectCardProps> = ({ index, uniqueEffect, item, itemType }) => {
    const { t } = useTranslation();

    return (
        <Card
            elevation={0}
            sx={{ alignItems: "center", display: "flex", mb: 1, userSelect: "none" }}>
            {uniqueEffect.icon ? (
                <Box sx={{ alignItems: "center", display: "flex", justifyContent: "center", p: 2 }}>
                    <CardMedia
                        component="img"
                        sx={{ height: imageSize, width: imageSize }}
                        image={uniqueEffect.icon}
                        alt={ttry(
                            itemTranslationIdentifier(itemType, item.name, "unique_effects", index.toString(), "title"),
                            "terms.unique-effect",
                        )}
                    />
                </Box>
            ) : null}
            <Box sx={{ display: "flex", flexDirection: "column" }}>
                <CardContent sx={{ flex: "1 0 auto" }}>
                    <Box
                        display="flex"
                        alignItems="center">
                        <Typography
                            component="div"
                            variant="h6"
                            sx={{ mb: 1 }}>
                            {t(itemTranslationIdentifier(itemType, item.name, "name"))}{" "}
                            {ttry(
                                itemTranslationIdentifier(
                                    itemType,
                                    item.name,
                                    "unique_effects",
                                    index.toString(),
                                    "title",
                                ),
                                "terms.unique-effect",
                            )}
                        </Typography>
                    </Box>
                    <Typography
                        variant="subtitle1"
                        color="text.secondary"
                        component="div">
                        {renderItemText(
                            t(
                                itemTranslationIdentifier(
                                    itemType,
                                    item.name,
                                    "unique_effects",
                                    index.toString(),
                                    "description",
                                ),
                            ),
                        )}
                    </Typography>
                </CardContent>
            </Box>
        </Card>
    );
};

export default UniqueEffectCard;