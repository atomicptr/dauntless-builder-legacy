import { Tooltip } from "@mui/material";
import { Tags } from "@src/data/Tags";
import React from "react";
import { useTranslation } from "react-i18next";
import { BsHandThumbsUp } from "react-icons/bs";
import { FaTrophy } from "react-icons/fa";
import { match } from "ts-pattern";

interface TagIconsProps {
    item: { tags?: Tags[] };
}

const ICON_SIZE = 16;

const TagIconEventItem = () => {
    const { t } = useTranslation();
    return (
        <Tooltip title={t("components.event-marker")}>
            <div>
                <FaTrophy size={ICON_SIZE} />
            </div>
        </Tooltip>
    );
};

const TagIconRecommended = () => {
    const { t } = useTranslation();
    return (
        <Tooltip title={t("components.recommended")}>
            <div>
                <BsHandThumbsUp size={ICON_SIZE} />
            </div>
        </Tooltip>
    );
};

const TagIcons: React.FC<TagIconsProps> = ({ item }) => {
    if (!item.tags) {
        return null;
    }

    return (
        <>
            {item.tags.map(tag =>
                match(tag)
                    .with(Tags.Event, () => <TagIconEventItem key={tag} />)
                    .with(Tags.Recommended, () => <TagIconRecommended key={tag} />)
                    .otherwise(() => null),
            )}
        </>
    );
};

export default React.memo(TagIcons);
