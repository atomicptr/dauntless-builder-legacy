import { Star } from "@mui/icons-material";
import { Box, Card, CardActionArea, CardContent, CardMedia, Skeleton, Stack, Typography } from "@mui/material";
import ElementalIcon from "@src/components/elemental-icon/ElementalIcon";
import PerksText from "@src/components/perks-text/PerksText";
import { itemPickerDefaultImageSize } from "@src/components/theme/theme";
import { Armour } from "@src/data/Armour";
import { isArmourType, ItemType } from "@src/data/ItemType";
import { Lantern } from "@src/data/Lantern";
import { Omnicell } from "@src/data/Omnicell";
import { Weapon } from "@src/data/Weapon";
import useIsMobile from "@src/hooks/is-mobile";
import { itemTranslationIdentifier } from "@src/utils/item-translation-identifier";
import React, { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { LazyLoadComponent } from "react-lazy-load-image-component";
import { match } from "ts-pattern";

export type ItemPickerItem = Weapon | Armour | Lantern | Omnicell | null;

interface ItemPickerProps {
    type: ItemType;
    item: ItemPickerItem;
    isPowerSurged?: boolean;
    onClick: (itemType: ItemType) => void;

    componentsOnSide?: (item: ItemPickerItem, itemType: ItemType) => ReactNode;
    componentsBelow?: (item: ItemPickerItem, itemType: ItemType) => ReactNode;
    componentsInside?: (item: ItemPickerItem, itemType: ItemType) => ReactNode;
}

const imageSize = itemPickerDefaultImageSize;

const ItemPicker: React.FC<ItemPickerProps> = ({
    type,
    item,
    isPowerSurged,
    onClick,
    componentsOnSide,
    componentsBelow,
    componentsInside,
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
            <Card sx={{ mb: 1, width: "100%" }}>
                <CardActionArea
                    onClick={onItemSelected}
                    sx={{ display: "flex", justifyContent: "flex-start" }}
                >
                    <Box sx={{ alignItems: "center", display: "flex", justifyContent: "center", p: 2 }}>
                        <CardMedia
                            component="img"
                            image={match(type)
                                .with(ItemType.Weapon, () => "/assets/icons/generic/Weapon.png")
                                .with(ItemType.Head, () => "/assets/icons/generic/Head.png")
                                .with(ItemType.Torso, () => "/assets/icons/generic/Torso.png")
                                .with(ItemType.Arms, () => "/assets/icons/generic/Arms.png")
                                .with(ItemType.Legs, () => "/assets/icons/generic/Legs.png")
                                .with(ItemType.Lantern, () => "/assets/icons/generic/Lantern.png")
                                .with(ItemType.Omnicell, () => "/assets/icons/generic/Omnicell.png")
                                .otherwise(() => "/assets/noicon.png")}
                            sx={{ height: imageSize, width: imageSize }}
                        />
                    </Box>
                    <Box>
                        <Typography
                            component="div"
                            sx={{ mb: 1 }}
                            variant="h5"
                        >
                            <span
                                dangerouslySetInnerHTML={{
                                    __html: t("pages.build.no-x-selected", { name: typeName(type) }),
                                }}
                            />
                        </Typography>
                        <Typography
                            color="text.secondary"
                            component="div"
                            variant="subtitle1"
                        >
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
                spacing={isMobile ? 0 : 1}
                sx={{ width: "100%" }}
            >
                <Card sx={{ flexGrow: 5, mb: 1, userSelect: "none", width: "100%" }}>
                    <CardActionArea
                        onClick={onItemSelected}
                        sx={{ display: "flex", height: "100%", justifyContent: "flex-start" }}
                    >
                        <Box sx={{ alignItems: "center", display: "flex", justifyContent: "center", p: 2 }}>
                            <LazyLoadComponent
                                placeholder={
                                    <Skeleton
                                        height={imageSize}
                                        variant="circular"
                                        width={imageSize}
                                    />
                                }
                            >
                                <CardMedia
                                    alt={t(itemTranslationIdentifier(type, item.name, "name"))}
                                    component={"img"}
                                    image={item.icon ?? "/assets/noicon.png"}
                                    sx={{ height: imageSize, width: imageSize }}
                                />
                            </LazyLoadComponent>
                        </Box>
                        <Box sx={{ display: "flex", flexDirection: "column" }}>
                            <CardContent sx={{ flex: "1 0 auto" }}>
                                <Box
                                    alignItems="center"
                                    display="flex"
                                >
                                    <Typography
                                        component="div"
                                        sx={{ alignItems: "center", display: "flex", mb: 1 }}
                                        variant="h5"
                                    >
                                        {t(itemTranslationIdentifier(type, item.name, "name"))}
                                        {isPowerSurged ? <Star sx={{ ml: 1 }} /> : null}
                                    </Typography>
                                </Box>

                                {type === ItemType.Weapon ? (
                                    <>
                                        <Box sx={{ alignItems: "center", display: "flex" }}>
                                            <Typography
                                                color="text.secondary"
                                                component="span"
                                                sx={{ mr: 1 }}
                                                variant="subtitle1"
                                            >
                                                <b>{t("terms.power")}</b>
                                                {": "}
                                                {isPowerSurged
                                                    ? (item as Weapon).power.powerSurged
                                                    : (item as Weapon).power.base}
                                            </Typography>
                                            <ElementalIcon
                                                item={item as Weapon}
                                                itemType={type}
                                            />
                                        </Box>
                                        {((item as Weapon)?.perks ?? []).length > 0 ? (
                                            <Typography
                                                color="text.secondary"
                                                component="div"
                                                variant="subtitle1"
                                            >
                                                <PerksText
                                                    itemSurged={isPowerSurged}
                                                    perks={(item as Weapon)?.perks ?? []}
                                                />
                                            </Typography>
                                        ) : null}
                                    </>
                                ) : null}

                                {isArmourType(type) ? (
                                    <>
                                        <Box sx={{ alignItems: "center", display: "flex" }}>
                                            <Typography
                                                color="text.secondary"
                                                component="span"
                                                sx={{ mr: 1 }}
                                                variant="subtitle1"
                                            >
                                                <b>{t("terms.resistance")}</b>
                                                {": "}
                                                {isPowerSurged
                                                    ? (item as Armour).resistance.powerSurged
                                                    : (item as Armour).resistance.base}
                                            </Typography>
                                            <ElementalIcon
                                                item={item as Weapon}
                                                itemType={type}
                                            />
                                        </Box>
                                        {((item as Armour)?.perks ?? []).length > 0 ? (
                                            <Typography
                                                color="text.secondary"
                                                component="div"
                                                variant="subtitle1"
                                            >
                                                <PerksText
                                                    itemSurged={isPowerSurged}
                                                    perks={(item as Armour)?.perks ?? []}
                                                />
                                            </Typography>
                                        ) : null}
                                    </>
                                ) : null}

                                {type === ItemType.Lantern ? (
                                    <Typography
                                        color="text.secondary"
                                        component="div"
                                        variant="subtitle1"
                                    >
                                        <div
                                            dangerouslySetInnerHTML={{
                                                __html: t("components.item-picker.lantern-hold-line", {
                                                    hold: t(
                                                        itemTranslationIdentifier(
                                                            ItemType.Lantern,
                                                            item.name,
                                                            "lantern_ability",
                                                            "hold",
                                                        ),
                                                    ),
                                                }),
                                            }}
                                        />
                                    </Typography>
                                ) : null}

                                {type === ItemType.Omnicell ? (
                                    <Typography
                                        color="text.secondary"
                                        component="div"
                                        variant="subtitle1"
                                    >
                                        <div
                                            dangerouslySetInnerHTML={{
                                                __html: t("components.item-picker.omnicell-passive-line", {
                                                    passive: t(
                                                        itemTranslationIdentifier(
                                                            ItemType.Omnicell,
                                                            item.name,
                                                            "passive",
                                                        ),
                                                    ),
                                                }),
                                            }}
                                        />
                                    </Typography>
                                ) : null}

                                {componentsInside ? componentsInside(item, type) : null}
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
