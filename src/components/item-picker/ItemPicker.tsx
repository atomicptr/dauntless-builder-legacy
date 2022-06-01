import { Star } from "@mui/icons-material";
import { Box, Card, CardActionArea, CardContent, CardMedia, Stack, Typography } from "@mui/material";
import React, { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { match } from "ts-pattern";

import { Armour } from "../../data/Armour";
import { isArmourType, ItemType } from "../../data/ItemType";
import { Lantern } from "../../data/Lantern";
import { Omnicell } from "../../data/Omnicell";
import { Weapon } from "../../data/Weapon";
import useIsMobile from "../../hooks/is-mobile";
import { itemTranslationIdentifier } from "../../utils/item-translation-identifier";
import { itemPickerDefaultImageSize } from "../theme/theme";
import Elemental from "./Elemental";
import PerksText from "./PerksText";

export type ItemPickerItem = Weapon | Armour | Lantern | Omnicell | null;

interface ItemPickerProps {
    type: ItemType;
    item: ItemPickerItem;
    isPowerSurged?: boolean;
    onClick: (itemType: ItemType) => void;

    componentsOnSide?: (item: ItemPickerItem, itemType: ItemType) => ReactNode;
    componentsBelow?: (item: ItemPickerItem, itemType: ItemType) => ReactNode;
}

const imageSize = itemPickerDefaultImageSize;

const ItemPicker: React.FC<ItemPickerProps> = ({
    type,
    item,
    isPowerSurged,
    onClick,
    componentsOnSide,
    componentsBelow,
}) => {
    const { t } = useTranslation();

    const isMobile = useIsMobile();

    const typeName = (type: ItemType): string =>
        match(type)
            .with(ItemType.Weapon, () => t("terms.weapon"))
            .with(ItemType.Head, () => t("terms.head-armour"))
            .with(ItemType.Torso, () => t("terms.torso-armour"))
            .with(ItemType.Arms, () => t("terms.arms-armour"))
            .with(ItemType.Legs, () => t("terms.legs-armour"))
            .with(ItemType.Lantern, () => t("terms.lantern"))
            .with(ItemType.Omnicell, () => t("terms.omnicell"))
            .otherwise(() => "???");

    const onItemSelected = () => {
        onClick(type);
    };

    if (item === null) {
        return (
            <Card sx={{ mb: 1 }}>
                <CardActionArea
                    sx={{ display: "flex", justifyContent: "flex-start" }}
                    onClick={onItemSelected}>
                    <Box sx={{ alignItems: "center", display: "flex", justifyContent: "center", p: 2 }}>
                        <CardMedia
                            component="img"
                            sx={{ height: imageSize, width: imageSize }}
                            image={match(type)
                                .with(ItemType.Weapon, () => "/assets/icons/generic/Weapon.png")
                                .with(ItemType.Head, () => "/assets/icons/generic/Head.png")
                                .with(ItemType.Torso, () => "/assets/icons/generic/Torso.png")
                                .with(ItemType.Arms, () => "/assets/icons/generic/Arms.png")
                                .with(ItemType.Legs, () => "/assets/icons/generic/Legs.png")
                                .with(ItemType.Lantern, () => "/assets/icons/generic/Lantern.png")
                                .with(ItemType.Omnicell, () => "/assets/icons/generic/Omnicell.png")
                                .otherwise(() => "/assets/noicon.png")}
                        />
                    </Box>
                    <Box>
                        <Typography
                            component="div"
                            variant="h5"
                            sx={{ mb: 1 }}>
                            <span
                                dangerouslySetInnerHTML={{
                                    __html: t("pages.build.no-x-selected", { name: typeName(type) }),
                                }}></span>
                        </Typography>
                        <Typography
                            variant="subtitle1"
                            color="text.secondary"
                            component="div">
                            {t("pages.build.click-here-to-select")}
                        </Typography>
                    </Box>
                </CardActionArea>
            </Card>
        );
    }

    return (
        <>
            <Stack
                direction={isMobile ? "column" : "row"}
                spacing={isMobile ? 0 : 1}>
                <Card sx={{ mb: 1, userSelect: "none", width: "100%" }}>
                    <CardActionArea
                        sx={{ display: "flex", height: "100%", justifyContent: "flex-start" }}
                        onClick={onItemSelected}>
                        <Box sx={{ alignItems: "center", display: "flex", justifyContent: "center", p: 2 }}>
                            <CardMedia
                                component="img"
                                sx={{ height: imageSize, width: imageSize }}
                                image={item.icon ?? "/assets/noicon.png"}
                                alt={t(itemTranslationIdentifier(type, item.name, "name"))}
                            />
                        </Box>
                        <Box sx={{ display: "flex", flexDirection: "column" }}>
                            <CardContent sx={{ flex: "1 0 auto" }}>
                                <Box
                                    display="flex"
                                    alignItems="center">
                                    <Typography
                                        component="div"
                                        variant="h5"
                                        sx={{ alignItems: "center", display: "flex", mb: 1 }}>
                                        {t(itemTranslationIdentifier(type, item.name, "name"))}
                                        {isPowerSurged ? <Star sx={{ ml: 1 }} /> : null}
                                    </Typography>
                                </Box>

                                {type === ItemType.Weapon ? (
                                    <>
                                        <Box sx={{ alignItems: "center", display: "flex" }}>
                                            <Typography
                                                variant="subtitle1"
                                                color="text.secondary"
                                                component="span"
                                                sx={{ mr: 1 }}>
                                                <b>{t("terms.power")}</b>:{" "}
                                                {isPowerSurged ? (item as Weapon).power.powerSurged : (item as Weapon).power.base}
                                            </Typography>
                                            <Elemental
                                                item={item as Weapon}
                                                itemType={type}
                                            />
                                        </Box>
                                        {((item as Weapon)?.perks ?? []).length > 0 ? (
                                            <Typography
                                                variant="subtitle1"
                                                color="text.secondary"
                                                component="div">
                                                <PerksText
                                                    perks={(item as Weapon)?.perks ?? []}
                                                    itemSurged={isPowerSurged}
                                                />
                                            </Typography>
                                        ) : null}
                                    </>
                                ) : null}

                                {isArmourType(type) ? (
                                    <>
                                        <Box sx={{ alignItems: "center", display: "flex" }}>
                                            <Typography
                                                variant="subtitle1"
                                                color="text.secondary"
                                                component="span"
                                                sx={{ mr: 1 }}>
                                                <b>{t("terms.resistance")}</b>:{" "}
                                                {isPowerSurged ? (item as Armour).resistance.powerSurged : (item as Armour).resistance.base}
                                            </Typography>
                                            <Elemental
                                                item={item as Weapon}
                                                itemType={type}
                                            />
                                        </Box>
                                        {((item as Armour)?.perks ?? []).length > 0 ? (
                                            <Typography
                                                variant="subtitle1"
                                                color="text.secondary"
                                                component="div">
                                                <PerksText
                                                    perks={(item as Armour)?.perks ?? []}
                                                    itemSurged={isPowerSurged}
                                                />
                                            </Typography>
                                        ) : null}
                                    </>
                                ) : null}

                                {type === ItemType.Lantern ? (
                                    <Typography
                                        variant="subtitle1"
                                        color="text.secondary"
                                        component="div">
                                        <b>{t("terms.hold")}</b>: {(item as Lantern).lantern_ability.hold}
                                    </Typography>
                                ) : null}

                                {type === ItemType.Omnicell ? (
                                    <Typography
                                        variant="subtitle1"
                                        color="text.secondary"
                                        component="div">
                                        <b>{t("terms.passive")}</b>: {(item as Omnicell).passive}
                                    </Typography>
                                ) : null}
                            </CardContent>
                        </Box>
                    </CardActionArea>
                </Card>

                {componentsOnSide ? componentsOnSide(item, type) : null}
            </Stack>

            {componentsBelow ? componentsBelow(item, type) : null}
        </>
    );
};

export default ItemPicker;
