import { Box, CardContent, CardMedia, Typography } from "@mui/material";
import React from "react";
import { useTranslation } from "react-i18next";

import { ItemType } from "../../data/ItemType";
import { Omnicell } from "../../data/Omnicell";
import { renderItemText } from "../../utils/item-text-renderer";
import { itemTranslationIdentifier } from "../../utils/item-translation-identifier";
import { itemPickerDefaultImageSize } from "../theme/theme";

interface OmnicellCardProps {
    item: Omnicell | null;
}

const imageSize = itemPickerDefaultImageSize;

const OmnicellCard: React.FC<OmnicellCardProps> = ({ item }) => {
    const { t } = useTranslation();

    if (item === null) {
        return null;
    }

    return (
        <Box
            sx={{ alignItems: "center", display: "flex", mb: 1, userSelect: "none" }}>
            <Box
                sx={{ alignItems: "center", display: "flex", justifyContent: "center", p: 2 }}>
                <CardMedia
                    alt={`${t(itemTranslationIdentifier(ItemType.Omnicell, item.name, "name"))} ${t(
                        "terms.active-ability",
                    )}`}
                    component="img"
                    image={(item as Omnicell).ability_icon ?? "/assets/noicon.png"}
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
                            sx={{ mb: 1 }}
                            variant="h5">
                            {t(itemTranslationIdentifier(ItemType.Omnicell, item.name, "name"))}{" "}
                            {t("terms.active-ability")}
                        </Typography>
                    </Box>
                    <Typography
                        color="text.secondary"
                        component="div"
                        variant="subtitle1">
                        <b>{t("terms.active")}</b>:{" "}
                        {renderItemText(t(itemTranslationIdentifier(ItemType.Omnicell, item.name, "active")))}
                    </Typography>
                </CardContent>
            </Box>
        </Box>
    );
};

export default OmnicellCard;
