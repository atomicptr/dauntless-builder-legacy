import { Box, CardContent, CardMedia, Skeleton, Typography } from "@mui/material";
import { itemPickerDefaultImageSize } from "@src/components/theme";
import { Armour } from "@src/data/Armour";
import { ItemType } from "@src/data/ItemType";
import { UniqueEffect } from "@src/data/UniqueEffect";
import { Weapon } from "@src/data/Weapon";
import { ttry } from "@src/i18n";
import { renderItemText } from "@src/utils/item-text-renderer";
import { itemTranslationIdentifier } from "@src/utils/item-translation-identifier";
import log from "@src/utils/logger";
import React from "react";
import { useTranslation } from "react-i18next";
import { LazyLoadComponent } from "react-lazy-load-image-component";

interface UniqueEffectCardProps {
    uniqueEffect: UniqueEffect;
    item: Weapon | Armour;
    itemType: ItemType;
}

const imageSize = itemPickerDefaultImageSize;

const UniqueEffectCard: React.FC<UniqueEffectCardProps> = ({ uniqueEffect, item, itemType }) => {
    const { t } = useTranslation();

    // find the UE among the items UEs
    const index = item.unique_effects?.findIndex(
        ue =>
            ue.name === uniqueEffect.name &&
            ue.powerSurged === uniqueEffect.powerSurged &&
            ue.description === uniqueEffect.description,
    );

    // if it can't find it, its invalid just render nothing
    if (!index) {
        log.error(`UE could not be found inside item ${item.name}`, { uniqueEffect });
        return null;
    }

    return (
        <Box sx={{ alignItems: "center", display: "flex", mb: 1, userSelect: "none" }}>
            {uniqueEffect.icon ? (
                <Box sx={{ alignItems: "center", display: "flex", justifyContent: "center", p: 2 }}>
                    <LazyLoadComponent
                        placeholder={
                            <Skeleton
                                height={imageSize}
                                variant="circular"
                                width={imageSize}
                            />
                        }
                    >
                        <CardMedia
                            alt={ttry(
                                itemTranslationIdentifier(
                                    itemType,
                                    item.name,
                                    "unique_effects",
                                    index.toString(),
                                    "title",
                                ),
                                "terms.unique-effect",
                            )}
                            component={"img"}
                            image={uniqueEffect.icon ?? "/assets/noicon.png"}
                            sx={{ height: imageSize, width: imageSize }}
                        />
                    </LazyLoadComponent>
                </Box>
            ) : null}
            <Box sx={{ display: "flex", flexDirection: "column" }}>
                <CardContent sx={{ flex: "1 0 auto" }}>
                    <Box
                        alignItems="center"
                        display="flex"
                    >
                        <Typography
                            component="div"
                            sx={{ mb: 1 }}
                            variant="h6"
                        >
                            {t(itemTranslationIdentifier(itemType, item.name, "name"))}
                            {" "}
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
                        color="text.secondary"
                        component="div"
                        variant="subtitle1"
                    >
                        {renderItemText(
                            t(
                                itemTranslationIdentifier(
                                    itemType,
                                    item.name,
                                    "unique_effects",
                                    index.toString(),
                                    "description",
                                ),
                                uniqueEffect.values ?? {},
                            ),
                        )}
                    </Typography>
                </CardContent>
            </Box>
        </Box>
    );
};

export default React.memo(UniqueEffectCard);
