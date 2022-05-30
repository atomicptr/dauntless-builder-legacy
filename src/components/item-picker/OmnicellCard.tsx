import { Box, Card, CardContent, CardMedia, Typography } from "@mui/material";
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
        <Card
            elevation={0}
            sx={{ alignItems: "center", display: "flex", mb: 1, userSelect: "none" }}>
            <Box sx={{ alignItems: "center", display: "flex", justifyContent: "center", p: 2 }}>
                <CardMedia
                    component="img"
                    sx={{ height: imageSize, width: imageSize }}
                    image={(item as Omnicell).ability_icon ?? "/assets/noicon.png"}
                    alt={`${t(itemTranslationIdentifier(ItemType.Omnicell, item.name, "name"))} ${t(
                        "terms.active-ability",
                    )}`}
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
                            sx={{ mb: 1 }}>
                            {t(itemTranslationIdentifier(ItemType.Omnicell, item.name, "name"))}{" "}
                            {t("terms.active-ability")}
                        </Typography>
                    </Box>
                    <Typography
                        variant="subtitle1"
                        color="text.secondary"
                        component="div">
                        <b>{t("terms.active")}</b>:{" "}
                        {renderItemText(t(itemTranslationIdentifier(ItemType.Omnicell, item.name, "active")))}
                    </Typography>
                </CardContent>
            </Box>
        </Card>
    );
};

export default OmnicellCard;
