import { Card } from "@mui/material";
import { styled } from "@mui/material/styles";
import { rarityColor } from "@src/components/theme";
import { ItemRarity } from "@src/data/ItemRarity";
import React from "react";

interface RarityCardProps {
    rarity?: ItemRarity;
    disabled?: boolean;
}

const RarityCard = styled(Card)<RarityCardProps>(({ rarity, disabled, theme }) => ({
    "&:hover": {
        background: disabled ? undefined : rarity ? rarityColor[rarity].light : undefined,
    },
    background: rarity ? rarityColor[rarity][disabled ? "dark" : "main"] : undefined,
    color: rarity ? theme.palette.grey[50] : undefined,
}));

export default React.memo(RarityCard);
