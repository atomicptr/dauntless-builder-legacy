import { Tooltip } from "@mui/material";
import { Armour } from "@src/data/Armour";
import { Tags } from "@src/data/Tags";
import { Weapon } from "@src/data/Weapon";
import React from "react";
import { useTranslation } from "react-i18next";

interface EventMarkerProps {
    item: Weapon | Armour;
}

const EventMarker: React.FC<EventMarkerProps> = ({ item }) => {
    const { t } = useTranslation();

    if (!item.tags) {
        return null;
    }

    if (item.tags.indexOf(Tags.Event) === -1) {
        return null;
    }

    return (
        <Tooltip title={t("components.event-marker")}>
            <span>{"🤡"}</span>
        </Tooltip>
    );
};

export default React.memo(EventMarker);
