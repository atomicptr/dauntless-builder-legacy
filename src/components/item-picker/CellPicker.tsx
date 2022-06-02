import { Box, Card, CardActionArea, CardMedia, Typography, useTheme } from "@mui/material";
import React from "react";
import { useTranslation } from "react-i18next";

import { findCellByVariantName } from "../../data/BuildModel";
import { CellType } from "../../data/Cell";
import { ItemType } from "../../data/ItemType";
import { itemTranslationIdentifier } from "../../utils/item-translation-identifier";
import { itemPickerDefaultImageSize, rarityColor } from "../theme/theme";

interface CellPickerProps {
    variant: string | null;
    index: number;
    itemType: ItemType;
    cellType: CellType;
    onClicked?: (itemType: ItemType, cellType: CellType, index: number) => void;
}

const imageSize = itemPickerDefaultImageSize;

const CellPicker: React.FC<CellPickerProps> = ({ variant, index, itemType, cellType, onClicked }) => {
    const theme = useTheme();
    const { t } = useTranslation();

    const cell = variant !== null ? findCellByVariantName(variant) : null;

    const variantIndex = cell != null && variant !== null ? Object.keys(cell.variants).indexOf(variant) : -1;

    const cellStyle =
        variant === null
            ? {}
            : {
                background: rarityColor[cell?.variants[variant]?.rarity ?? "uncommon"],
                borderRadius: "200px",
                padding: 1,
            };

    return (
        <Card
            sx={{
                mb: `${theme.spacing(1)} !important`,
                minWidth: imageSize * 2.5,
                userSelect: "none",
            }}>
            <CardActionArea
                disabled={!onClicked}
                onClick={onClicked ? () => onClicked(itemType, cellType, index) : undefined}
                sx={{
                    alignItems: "center",
                    display: "flex",
                    flexDirection: "column",
                    height: "100%",
                    justifyContent: "center",
                    pb: 2,
                    pt: 2,
                    width: "100%",
                }}>
                <Box
                    sx={{ alignItems: "center", display: "flex", justifyContent: "center", pl: 2, pr: 2 }}>
                    <CardMedia
                        component="img"
                        image={`/assets/icons/perks/${cellType}.png`}
                        sx={{ height: imageSize, width: imageSize, ...cellStyle }} />
                </Box>
                {cell !== null ? (
                    <Typography
                        sx={{ pt: 1 }}>
                        {t(itemTranslationIdentifier(ItemType.Cell, cell.name, "variants", variantIndex.toString()))}
                    </Typography>
                ) : null}
            </CardActionArea>
        </Card>
    );
};

export default CellPicker;
