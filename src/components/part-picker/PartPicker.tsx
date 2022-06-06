import { QuestionMark } from "@mui/icons-material";
import { Box, Card, CardActionArea, CardContent, CardMedia, Skeleton, Typography } from "@mui/material";
import { itemPickerDefaultImageSize } from "@src/components/theme/theme";
import { Part, PartType } from "@src/data/Part";
import { WeaponType } from "@src/data/Weapon";
import { partsTranslationIdentifier } from "@src/utils/item-translation-identifier";
import React from "react";
import { useTranslation } from "react-i18next";
import { LazyLoadComponent } from "react-lazy-load-image-component";
import { match } from "ts-pattern";

interface PartPickerProps {
    type: PartType;
    item: Part | null;
    weaponType: WeaponType | null;
    onClick: (partType: PartType) => void;
}

const imageSize = itemPickerDefaultImageSize;

const PartPicker: React.FC<PartPickerProps> = ({ type, item, weaponType, onClick }) => {
    const { t } = useTranslation();

    const partTypeName = (partType: PartType): string =>
        match(partType)
            .with(PartType.Mod, () => t("terms.parts.mod"))
            .with(PartType.Special, () => t("terms.parts.special"))
            .with(PartType.Chamber, () => t("terms.parts.chamber"))
            .with(PartType.Grip, () => t("terms.parts.grip"))
            .run();

    if (weaponType === null) {
        return null;
    }

    if (item === null) {
        return (
            <Card sx={{ mb: 1 }}>
                <CardActionArea
                    onClick={() => onClick(type)}
                    sx={{ display: "flex", justifyContent: "flex-start" }}
                >
                    <Box sx={{ alignItems: "center", display: "flex", justifyContent: "center", p: 2 }}>
                        <CardMedia
                            component={QuestionMark}
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
                                    __html: t("pages.build.no-x-selected", { name: partTypeName(type) }),
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
        <Card sx={{ mb: 1, userSelect: "none", width: "100%" }}>
            <CardActionArea
                onClick={() => onClick(type)}
                sx={{ display: "flex", justifyContent: "flex-start" }}
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
                            alt={t(partsTranslationIdentifier(weaponType, type, item.name, "name"))}
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
                                {t(partsTranslationIdentifier(weaponType, type, item.name, "name"))}
                            </Typography>
                        </Box>
                        {item.part_effect.map((pe, index) => (
                            <Typography
                                key={index}
                                color="text.secondary"
                                component="div"
                                variant="subtitle1"
                            >
                                {t(
                                    partsTranslationIdentifier(
                                        weaponType,
                                        type,
                                        item.name,
                                        "part_effect",
                                        index.toString(),
                                    ),
                                )}
                            </Typography>
                        ))}
                    </CardContent>
                </Box>
            </CardActionArea>
        </Card>
    );
};

export default PartPicker;
