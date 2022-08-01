import { Box } from "@mui/material";
import { findPerkByName } from "@src/data/BuildModel";
import { ItemType } from "@src/data/ItemType";
import { PerkValue } from "@src/data/Perks";
import useIsMobile from "@src/hooks/is-mobile";
import useIsLightMode from "@src/hooks/light-mode";
import { itemTranslationIdentifier } from "@src/utils/item-translation-identifier";
import React from "react";
import { useTranslation } from "react-i18next";

interface PerksTextProps {
    perks: PerkValue[];
    itemSurged?: boolean;
}

const PerksText: React.FC<PerksTextProps> = ({ perks, itemSurged }) => {
    const { t } = useTranslation();
    const isMobile = useIsMobile();
    const isLightMode = useIsLightMode();

    if (perks.length === 0) {
        return null;
    }

    const filter = isLightMode ? "invert(100%)" : undefined;

    const currentPerks = perks.filter(perk => perk.powerSurged === (itemSurged ?? false));
    const perkList = currentPerks.map((perk, index) => (
        <Box
            key={index}
            alignItems="center"
            component="span"
            display="flex"
            gap={0.5}
        >
            <Box component="span">{` + ${perk.value} `}</Box>

            <img
                alt={findPerkByName(perk.name)?.type}
                src={`/assets/icons/perks/${findPerkByName(perk.name)?.type}.png`}
                style={{ filter, height: "16px", width: "16px" }}
            />

            <Box component="span">
                {` ${t(itemTranslationIdentifier(ItemType.Perk, perk.name, "name"))} ${
                    index !== currentPerks.length - 1 ? ", " : ""
                }`}
            </Box>
        </Box>
    ));

    return (
        <Box
            alignItems={isMobile ? "flex-start" : "center"}
            component="span"
            display="flex"
            flexDirection={isMobile ? "column" : "row"}
            gap={0.5}
        >
            <Box>
                <b>{t("terms.perks") + ":"}</b>
            </Box>
            <Box>{perkList}</Box>
        </Box>
    );
};

export default React.memo(PerksText);
