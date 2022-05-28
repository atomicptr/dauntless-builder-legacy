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

    const currentPerks = perks.filter(perk => (itemSurged ? perk.from === 1 : perk.from === 0));
    const perkList = currentPerks.map((perk, index) => (
        <Box
            key={index}
            component="span"
            display="flex"
            alignItems="center">
            +{perk.value}&nbsp;
            <img
                style={{ height: "16px", width: "16px" }}
                alt={findPerkByName(perk.name)?.type}
                src={`/assets/icons/perks/${findPerkByName(perk.name)?.type}.png`}
            />
            &nbsp;
            {perk.name}&nbsp;
            {index !== currentPerks.length - 1 ? ", " : ""}
        </Box>
    ));

    return (
        <Box
            component="span"
            display="flex"
            alignItems="center">
            <b>{t("terms.perks")}</b>:&nbsp;{perkList}
        </Box>
    );
};

export default PerksText;
