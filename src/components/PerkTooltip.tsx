import { Box, Stack, useTheme } from "@mui/material";
import { perkEffectDescriptionById } from "@src/components/PerkList";
import { ItemType } from "@src/data/ItemType";
import { Perk } from "@src/data/Perks";
import { itemTranslationIdentifier } from "@src/utils/item-translation-identifier";
import React from "react";
import { useTranslation } from "react-i18next";

interface PerkTooltipProps {
    perk: Perk;
    count: number;
    withDescription?: boolean;
    filterLevels?: string[];
}

const PerkTooltip: React.FC<PerkTooltipProps> = ({ perk, count, withDescription, filterLevels = [] }) => {
    const theme = useTheme();
    const { t } = useTranslation();

    filterLevels ??= [];

    return (
        <Box>
            {withDescription && (
                <Box sx={{ mb: count > 0 ? 1 : undefined }}>
                    {t(itemTranslationIdentifier(ItemType.Perk, perk.name, "description"))}
                </Box>
            )}

            {Object.keys(perk.effects)
                .filter(id => (filterLevels.length > 0 ? filterLevels.indexOf(id) > -1 : true))
                .map(id => (
                    <Box
                        key={id}
                        sx={{ color: theme.palette.grey[id === Math.max(0, Math.min(6, count)).toString() ? 50 : 400] }}
                    >
                        <Stack
                            direction="row"
                            spacing={1}
                        >
                            <Box sx={{ whiteSpace: "nowrap" }}>{`+ ${id}`}</Box>
                            <Box>{perkEffectDescriptionById(perk, id)}</Box>
                        </Stack>
                    </Box>
                ))}
        </Box>
    );
};

export default React.memo(PerkTooltip);
