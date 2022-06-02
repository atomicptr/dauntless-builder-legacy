import { Box, Card, CardActionArea, CardMedia, Typography, useTheme } from "@mui/material";
import React from "react";
import { useTranslation } from "react-i18next";
import { match } from "ts-pattern";

import { findCellByVariantName } from "../../data/BuildModel";
import { CellType } from "../../data/Cell";
import { ItemType } from "../../data/ItemType";
import { selectBuild } from "../../features/build/build-slice";
import { useAppSelector } from "../../hooks/redux";
import { itemTranslationIdentifier } from "../../utils/item-translation-identifier";
import { itemPickerDefaultImageSize, rarityColor } from "../theme/theme";

interface CellPickerProps {
    index: number;
    itemType: ItemType;
    cellType: CellType;
    onClicked?: (itemType: ItemType, cellType: CellType, index: number) => void;
}

const imageSize = itemPickerDefaultImageSize;

const CellPicker: React.FC<CellPickerProps> = ({ index, itemType, cellType, onClicked }) => {
    const theme = useTheme();
    const { t } = useTranslation();
    const build = useAppSelector(selectBuild);

    const variant = match<ItemType, string | null>(itemType)
        .with(ItemType.Weapon, () => (index === 0 ? build.weaponCell1 : build.weaponCell2))
        .with(ItemType.Head, () => build.headCell)
        .with(ItemType.Torso, () => build.torsoCell)
        .with(ItemType.Arms, () => build.armsCell)
        .with(ItemType.Legs, () => build.legsCell)
        .with(ItemType.Lantern, () => build.lanternCell)
        .run();

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
