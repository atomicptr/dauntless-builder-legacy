import { Error, Warning } from "@mui/icons-material";
import {
    Card,
    CardActionArea,
    CardContent,
    CardMedia,
    Chip,
    Grid,
    Skeleton,
    Stack,
    SxProps,
    Tooltip,
    Typography,
    useTheme,
} from "@mui/material";
import { perkData, perkEffectDescriptionById } from "@src/components/PerkList";
import { BuildFlags, BuildModel } from "@src/data/BuildModel";
import { ItemType } from "@src/data/ItemType";
import { itemTranslationIdentifier } from "@src/utils/item-translation-identifier";
import log from "@src/utils/logger";
import React from "react";
import { useTranslation } from "react-i18next";
import { LazyLoadComponent } from "react-lazy-load-image-component";
import { NavLink } from "react-router-dom";

interface BuildCardProps {
    build?: BuildModel;
    buildId?: string;
    title?: string;
    miniMode?: boolean;
}

interface ItemWithIcon {
    name: string;
    icon?: string;
}

interface ItemIconProps {
    item: ItemWithIcon | null;
    miniMode: boolean;
    sx?: SxProps;
}

const ItemIcon: React.FC<ItemIconProps> = ({ item, miniMode, sx }) => {
    if (item === null) {
        return null;
    }

    const imageSize = miniMode ? 32 : 64;

    return (
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
                component={"img"}
                image={item.icon ?? "/assets/noicon.png"}
                sx={{ height: imageSize, width: imageSize, ...(sx ?? {}) }}
            />
        </LazyLoadComponent>
    );
};

const BuildCard: React.FC<BuildCardProps> = ({ build, buildId, title, miniMode }) => {
    const { t } = useTranslation();
    const theme = useTheme();

    if (!build) {
        if (buildId) {
            build = BuildModel.tryDeserialize(buildId);
        } else {
            log.error("Could not render BuildCard because no build or build ID was specified");
            return null;
        }
    }

    buildId = build.serialize();

    const omnicellName =
        build.data.omnicell !== null
            ? t(itemTranslationIdentifier(ItemType.Omnicell, build.data.omnicell.name, "name"))
            : "";
    const weaponName =
        build.data.weapon !== null ? t(itemTranslationIdentifier(ItemType.Weapon, build.data.weapon.name, "name")) : "";

    title = title?.replaceAll(/\{\{omnicellName}}/g, omnicellName).replaceAll(/\{\{weaponName}}/g, weaponName);

    const BuildFlagIcon = () => {
        if (build?.hasFlag(BuildFlags.InvalidBuild)) {
            return (
                <Tooltip title={t("components.build-warning.invalid-build")}>
                    <Error />
                </Tooltip>
            );
        }

        if (build?.hasFlag(BuildFlags.UpgradedBuild)) {
            return (
                <Tooltip title={t("components.build-warning.upgraded-build")}>
                    <Warning />
                </Tooltip>
            );
        }

        return null;
    };

    return (
        <Card sx={{ flexGrow: 10 }}>
            <CardActionArea
                component={NavLink}
                sx={{
                    alignItems: "flex-start",
                    display: "flex",
                    flexDirection: "column",
                    height: "100%",
                    justifyContent: "center",
                }}
                to={`/b/${buildId}`}
            >
                <CardContent>
                    <Stack
                        direction="row"
                        spacing={1}
                    >
                        <BuildFlagIcon />
                        <Typography>{title ?? `${omnicellName} / ${weaponName}`}</Typography>
                    </Stack>

                    <Grid
                        container
                        spacing={1}
                        sx={{ mt: 1 }}
                    >
                        <Grid item>
                            <ItemIcon
                                item={build.data.omnicell}
                                miniMode={!!miniMode}
                            />
                        </Grid>
                        <Grid
                            item
                            sx={{ position: "relative" }}
                        >
                            <ItemIcon
                                item={build.data.weapon}
                                miniMode={!!miniMode}
                            />
                            {build.data.bondWeapon && (
                                <ItemIcon
                                    item={build.data.bondWeapon}
                                    miniMode={!!miniMode}
                                    sx={{
                                        background: theme.palette.background.paper,
                                        borderRadius: 50,
                                        bottom: miniMode ? "-3px" : "-6px",
                                        height: miniMode ? "16px" : "32px",
                                        padding: 0.5,
                                        position: "absolute",
                                        right: miniMode ? "-3px" : "-6px",
                                        width: miniMode ? "16px" : "32px",
                                    }}
                                />
                            )}
                        </Grid>
                        <Grid item>
                            <ItemIcon
                                item={build.data.head}
                                miniMode={!!miniMode}
                            />
                        </Grid>
                        <Grid item>
                            <ItemIcon
                                item={build.data.torso}
                                miniMode={!!miniMode}
                            />
                        </Grid>
                        <Grid item>
                            <ItemIcon
                                item={build.data.arms}
                                miniMode={!!miniMode}
                            />
                        </Grid>
                        <Grid item>
                            <ItemIcon
                                item={build.data.legs}
                                miniMode={!!miniMode}
                            />
                        </Grid>
                        <Grid item>
                            <ItemIcon
                                item={build.data.lantern}
                                miniMode={!!miniMode}
                            />
                        </Grid>
                    </Grid>

                    {miniMode ? null : (
                        <Grid
                            container
                            spacing={1}
                            sx={{ maxWidth: "100%", mt: 1 }}
                        >
                            {perkData(build).map((perkData, index) => (
                                <Grid
                                    key={index}
                                    item
                                >
                                    <Tooltip
                                        title={perkEffectDescriptionById(
                                            perkData.data,
                                            Math.min(perkData.count, 6).toString(),
                                        )}
                                    >
                                        <Chip
                                            label={`+${perkData.count} ${t(
                                                itemTranslationIdentifier(ItemType.Perk, perkData.name, "name"),
                                            )}`}
                                        />
                                    </Tooltip>
                                </Grid>
                            ))}
                        </Grid>
                    )}
                </CardContent>
            </CardActionArea>
        </Card>
    );
};

export default BuildCard;
