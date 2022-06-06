import { Box, Card, CardActionArea, CardMedia, Typography, useTheme } from "@mui/material";
import { itemPickerDefaultImageSize, rarityColor } from "@src/components/theme/theme";
import { findCellByVariantName } from "@src/data/BuildModel";
import { CellType } from "@src/data/Cell";
import { ItemRarity } from "@src/data/ItemRarity";
import { ItemType } from "@src/data/ItemType";
import { itemTranslationIdentifier } from "@src/utils/item-translation-identifier";
import React from "react";
import { useTranslation } from "react-i18next";

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
                background: rarityColor[cell?.variants[variant]?.rarity ?? ItemRarity.Uncommon].main,
                borderRadius: "200px",
                padding: 1,
            };

    return (
        <Card
            sx={{
                mb: `${theme.spacing(1)} !important`,
                minWidth: imageSize * 2.5,
                userSelect: "none",
            }}
        >
            <CardActionArea
                disabled={!onClicked}
                onClick={onClicked ? () => onClicked(itemType, cellType, index) : undefined}
                sx={{
                    alignItems: "center",
                    display: "flex",
                    flexDirection: "column",
                    height: "100%",
                    justifyContent: "center",
                    p: 2,
                    textAlign: "center",
                    width: "100%",
                }}
            >
                <Box sx={{ alignItems: "center", display: "flex", justifyContent: "center", pl: 2, pr: 2 }}>
                    <CardMedia
                        component="img"
                        image={`/assets/icons/perks/${cell?.slot ?? cellType}.png`}
                        sx={{ height: imageSize, width: imageSize, ...cellStyle }}
                    />
                </Box>
                {cell !== null ? (
                    <Typography sx={{ pt: 1 }}>
                        {t(itemTranslationIdentifier(ItemType.Cell, cell.name, "variants", variantIndex.toString()))}
                    </Typography>
                ) : null}
            </CardActionArea>
        </Card>
    );
};

export default CellPicker;
