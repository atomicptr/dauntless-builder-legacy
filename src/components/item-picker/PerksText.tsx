import { Box } from "@mui/material";
import React from "react";
import { useTranslation } from "react-i18next";

import { findPerkByName } from "../../data/BuildModel";
import { PerkValue } from "../../data/Perks";

interface PerksTextProps {
    perks: PerkValue[];
    itemSurged?: boolean;
}

const PerksText: React.FC<PerksTextProps> = ({ perks, itemSurged }) => {
    const { t } = useTranslation();

    if (perks.length === 0) {
        return null;
    }

    const currentPerks = perks.filter(perk => perk.powerSurged === (itemSurged ?? false));
    const perkList = currentPerks.map((perk, index) => (
        <Box
            key={index}
            alignItems="center"
            component="span"
            display="flex">
            +{perk.value}&nbsp;
            <img
                alt={findPerkByName(perk.name)?.type}
                src={`/assets/icons/perks/${findPerkByName(perk.name)?.type}.png`}
                style={{ height: "16px", width: "16px" }} />
            &nbsp;
            {perk.name}&nbsp;
            {index !== currentPerks.length - 1 ? ", " : ""}
        </Box>
    ));

    return (
        <Box
            alignItems="center"
            component="span"
            display="flex">
            <b>{t("terms.perks")}</b>:&nbsp;{perkList}
        </Box>
    );
};

export default PerksText;
