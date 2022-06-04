import { Box, Stack } from "@mui/material";
import { Armour } from "@src/data/Armour";
import { ElementalType } from "@src/data/ElementalType";
import { ItemType } from "@src/data/ItemType";
import { Weapon } from "@src/data/Weapon";
import React from "react";

interface ElementalProps {
    item: Weapon | Armour | null;
    itemType: ItemType;
}

const ElementalIcon: React.FC<ElementalProps> = ({ item, itemType }) => {
    if (item === null) {
        return null;
    }

    if (itemType === ItemType.Weapon) {
        const { elemental } = item as Weapon;
        return elemental !== null ? (
            <Stack>
                <ElementalBox
                    elemental={elemental}
                    isStrength={true} />
            </Stack>
        ) : null;
    }

    const { strength, weakness } = item as Armour;

    return (
        <Stack
            direction="row"
            spacing={1}>
            {strength !== null ? (
                <ElementalBox
                    elemental={strength}
                    isStrength={true} />
            ) : null}
            {weakness !== null ? (
                <ElementalBox
                    elemental={weakness}
                    isStrength={false} />
            ) : null}
        </Stack>
    );
};

interface ElementalBoxProps {
    elemental: ElementalType;
    isStrength: boolean;
}

const ElementalBox: React.FC<ElementalBoxProps> = ({ elemental, isStrength }) => (
    <Box
        component="span"
        sx={{ alignItems: "center", display: "flex", flexDirection: "row" }}>
        <b>
            {isStrength ? "+" : "-"}
            &nbsp;
        </b>
        <img
            alt={elemental}
            src={`/assets/icons/elements/${elemental}.png`} />
    </Box>
);

export default ElementalIcon;
