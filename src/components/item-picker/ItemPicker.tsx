import { Star } from "@mui/icons-material";
import { Box, Card, CardActionArea, CardContent, CardMedia, Stack, Typography } from "@mui/material";
import React from "react";
import { useTranslation } from "react-i18next";

import { Armour } from "../../data/Armour";
import { BuildModel } from "../../data/BuildModel";
import { CellType } from "../../data/Cell";
import { ItemType } from "../../data/ItemType";
import { Lantern } from "../../data/Lantern";
import { Omnicell } from "../../data/Omnicell";
import { Weapon } from "../../data/Weapon";
import { selectBuild } from "../../features/build/build-slice";
import useIsMobile from "../../hooks/is-mobile";
import { useAppSelector } from "../../hooks/redux";
import { renderItemText } from "../../utils/item-text-renderer";
import { itemTranslationIdentifier } from "../../utils/item-translation-identifier";
import { itemPickerDefaultImageSize } from "../theme/theme";
import CellPicker from "./CellPicker";
import PerksText from "./PerksText";

interface ItemPickerProps {
    type: ItemType;
    onClick: (itemType: ItemType) => void;
    withCellPicker?: boolean;
    onCellClicked?: (itemType: ItemType, cellType: CellType, index: number) => void;
}

const imageSize = itemPickerDefaultImageSize;

const ItemPicker: React.FC<ItemPickerProps> = ({ type, onClick, withCellPicker, onCellClicked }) => {
    const build = useAppSelector(selectBuild);
    const { t } = useTranslation();

    const data = currentBuildDataByType(build, type);
    const isArmor = [ItemType.Head, ItemType.Torso, ItemType.Arms, ItemType.Legs].indexOf(type) >= 0;

    const isMobile = useIsMobile();

    const typeName = (type: ItemType): string => {
        switch (type) {
            case ItemType.Weapon:
                return t("terms.weapon");
            case ItemType.Head:
                return t("terms.head-armour");
            case ItemType.Torso:
                return t("terms.torso-armour");
            case ItemType.Arms:
                return t("terms.arms-armour");
            case ItemType.Legs:
                return t("terms.legs-armour");
            case ItemType.Lantern:
                return t("terms.lantern");
            case ItemType.Omnicell:
                return t("terms.omnicell");
        }

        return "";
    };

    const onItemSelected = () => {
        onClick(type);
    };

    if (data === null) {
        return (
            <Card sx={{ mb: 1 }}>
                <CardActionArea
                    sx={{ display: "flex", justifyContent: "flex-start" }}
                    onClick={onItemSelected}>
                    <Box sx={{ alignItems: "center", display: "flex", justifyContent: "center", p: 2 }}>
                        <CardMedia
                            component="img"
                            sx={{ height: imageSize, width: imageSize }}
                            image={"/assets/noicon.png" /* TODO: add generic type icon */}
                        />
                    </Box>
                    <Box>
                        <Typography
                            component="div"
                            variant="h5"
                            sx={{ mb: 1 }}>
                            No <b>{typeName(type)}</b> selected.
                        </Typography>
                        <Typography
                            variant="subtitle1"
                            color="text.secondary"
                            component="div">
                            Click here to select one.
                        </Typography>
                    </Box>
                </CardActionArea>
            </Card>
        );
    }

    const isPowerSurged =
        (type === ItemType.Weapon && build.weaponSurged) ||
        (type === ItemType.Head && build.headSurged) ||
        (type === ItemType.Torso && build.torsoSurged) ||
        (type === ItemType.Arms && build.armsSurged) ||
        (type === ItemType.Legs && build.legsSurged);

    return (
        <>
            <Stack
                direction={isMobile ? "column" : "row"}
                spacing={isMobile ? 0 : 1}>
                <Card sx={{ mb: 1, userSelect: "none", width: "100%" }}>
                    <CardActionArea
                        sx={{ display: "flex", justifyContent: "flex-start" }}
                        onClick={onItemSelected}>
                        <Box sx={{ alignItems: "center", display: "flex", justifyContent: "center", p: 2 }}>
                            <CardMedia
                                component="img"
                                sx={{ height: imageSize, width: imageSize }}
                                image={data.icon ?? "/assets/noicon.png"}
                                alt={t(itemTranslationIdentifier(type, data.name, "name"))}
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
                                        {t(itemTranslationIdentifier(type, data.name, "name"))}
                                        {isPowerSurged ? <Star sx={{ ml: 1 }} /> : null}
                                    </Typography>
                                </Box>

                                {type === ItemType.Weapon ? (
                                    <>
                                        <Typography
                                            variant="subtitle1"
                                            color="text.secondary"
                                            component="div">
                                            <b>{t("terms.power")}</b>: {(data as Weapon).power[isPowerSurged ? 1 : 0]}
                                        </Typography>
                                        {((data as Weapon)?.perks ?? []).length > 0 ? (
                                            <Typography
                                                variant="subtitle1"
                                                color="text.secondary"
                                                component="div">
                                                <PerksText
                                                    perks={(data as Weapon)?.perks ?? []}
                                                    itemSurged={isPowerSurged}
                                                />
                                            </Typography>
                                        ) : null}
                                    </>
                                ) : null}

                                {isArmor ? (
                                    <>
                                        <Typography
                                            variant="subtitle1"
                                            color="text.secondary"
                                            component="div">
                                            <b>{t("terms.resistance")}</b>:{" "}
                                            {(data as Armour).resistance[isPowerSurged ? 1 : 0]}
                                        </Typography>
                                        {((data as Armour)?.perks ?? []).length > 0 ? (
                                            <Typography
                                                variant="subtitle1"
                                                color="text.secondary"
                                                component="div">
                                                <PerksText
                                                    perks={(data as Armour)?.perks ?? []}
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
                                        <b>{t("terms.hold")}</b>: {(data as Lantern).lantern_ability.hold}
                                    </Typography>
                                ) : null}

                                {type === ItemType.Omnicell ? (
                                    <Typography
                                        variant="subtitle1"
                                        color="text.secondary"
                                        component="div">
                                        <b>{t("terms.passive")}</b>: {(data as Omnicell).passive}
                                    </Typography>
                                ) : null}
                            </CardContent>
                        </Box>
                    </CardActionArea>
                </Card>

                {withCellPicker && (type === ItemType.Weapon || isArmor || type === ItemType.Lantern)
                    ? (Array.isArray((data as Weapon | Armour | Lantern | null)?.cells)
                        ? ((data as Weapon | Armour | Lantern | null)?.cells as CellType[]) ?? []
                        : [(data as Weapon | Armour | Lantern | null)?.cells]
                    ).map((cellType, index) =>
                        cellType ? (
                            <CellPicker
                                key={index}
                                index={index}
                                itemType={type}
                                cellType={cellType as CellType}
                                onClicked={onCellClicked}
                            />
                        ) : null,
                    )
                    : null}
            </Stack>
            {type === ItemType.Weapon || isArmor
                ? (data as Weapon | Armour).unique_effects?.map((ue, index) => (
                    <Card
                        key={index}
                        sx={{ alignItems: "center", display: "flex", mb: 1, userSelect: "none" }}>
                        {ue.icon ? (
                            <Box sx={{ alignItems: "center", display: "flex", justifyContent: "center", p: 2 }}>
                                <CardMedia
                                    component="img"
                                    sx={{ height: imageSize, width: imageSize }}
                                    image={ue.icon}
                                    alt={`${t(itemTranslationIdentifier(type, data.name, "name"))} ${t(
                                        itemTranslationIdentifier(
                                            type,
                                            data.name,
                                            "unique_effects",
                                            index.toString(),
                                            "title",
                                        ),
                                        t("terms.unique-effect"),
                                    )}`}
                                />
                            </Box>
                        ) : null}
                        <Box sx={{ display: "flex", flexDirection: "column" }}>
                            <CardContent sx={{ flex: "1 0 auto" }}>
                                <Box
                                    display="flex"
                                    alignItems="center">
                                    <Typography
                                        component="div"
                                        variant="h6"
                                        sx={{ mb: 1 }}>
                                        {t(itemTranslationIdentifier(type, data.name, "name"))}{" "}
                                        {t(
                                            itemTranslationIdentifier(
                                                type,
                                                data.name,
                                                "unique_effects",
                                                index.toString(),
                                                "title",
                                            ),
                                            t("terms.unique-effect"),
                                        )}
                                    </Typography>
                                </Box>
                                <Typography
                                    variant="subtitle1"
                                    color="text.secondary"
                                    component="div">
                                    {renderItemText(
                                        t(
                                            itemTranslationIdentifier(
                                                type,
                                                data.name,
                                                "unique_effects",
                                                index.toString(),
                                                "description",
                                            ),
                                        ),
                                    )}
                                </Typography>
                            </CardContent>
                        </Box>
                    </Card>
                ))
                : null}

            {type === ItemType.Omnicell ? (
                <Card sx={{ alignItems: "center", display: "flex", mb: 1, userSelect: "none" }}>
                    <Box sx={{ alignItems: "center", display: "flex", justifyContent: "center", p: 2 }}>
                        <CardMedia
                            component="img"
                            sx={{ height: imageSize, width: imageSize }}
                            image={(data as Omnicell).ability_icon ?? "/assets/noicon.png"}
                            alt={`${t(itemTranslationIdentifier(type, data.name, "name"))} ${t(
                                "terms.active-ability",
                            )}`}
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
                                    sx={{ mb: 1 }}>
                                    {t(itemTranslationIdentifier(type, data.name, "name"))} {t("terms.active-ability")}
                                </Typography>
                            </Box>
                            <Typography
                                variant="subtitle1"
                                color="text.secondary"
                                component="div">
                                <b>{t("terms.active")}</b>:{" "}
                                {renderItemText(t(itemTranslationIdentifier(type, data.name, "active")))}
                            </Typography>
                        </CardContent>
                    </Box>
                </Card>
            ) : null}
        </>
    );
};

const currentBuildDataByType = (build: BuildModel, type: ItemType): Weapon | Armour | Lantern | Omnicell | null => {
    switch (type) {
        case ItemType.Weapon:
            return build.data.weapon;
        case ItemType.Head:
            return build.data.head;
        case ItemType.Torso:
            return build.data.torso;
        case ItemType.Arms:
            return build.data.arms;
        case ItemType.Legs:
            return build.data.legs;
        case ItemType.Lantern:
            return build.data.lantern;
        case ItemType.Omnicell:
            return build.data.omnicell;
    }

    return null;
};

export default ItemPicker;
