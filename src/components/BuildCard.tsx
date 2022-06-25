import { Card, CardActionArea, CardContent, CardMedia, Chip, Grid, Skeleton, Typography } from "@mui/material";
import { perkData } from "@src/components/PerkList";
import { BuildModel } from "@src/data/BuildModel";
import { ItemType } from "@src/data/ItemType";
import { itemTranslationIdentifier } from "@src/utils/item-translation-identifier";
import React from "react";
import { useTranslation } from "react-i18next";
import { LazyLoadComponent } from "react-lazy-load-image-component";
import { NavLink } from "react-router-dom";

interface BuildCardProps {
    buildId: string;
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
}

const ItemIcon: React.FC<ItemIconProps> = ({ item, miniMode }) => {
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
                sx={{ height: imageSize, width: imageSize }}
            />
        </LazyLoadComponent>
    );
};

const BuildCard: React.FC<BuildCardProps> = ({ buildId, title, miniMode }) => {
    const { t } = useTranslation();
    const build = BuildModel.deserialize(buildId);

    const omnicellName =
        build.data.omnicell !== null
            ? t(itemTranslationIdentifier(ItemType.Omnicell, build.data.omnicell.name, "name"))
            : "";
    const weaponName =
        build.data.weapon !== null ? t(itemTranslationIdentifier(ItemType.Weapon, build.data.weapon.name, "name")) : "";

    title = title?.replaceAll(/\{\{omnicellName}}/g, omnicellName).replaceAll(/\{\{weaponName}}/g, weaponName);

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
                    <Typography>{title ?? `${omnicellName} / ${weaponName}`}</Typography>

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
                        <Grid item>
                            <ItemIcon
                                item={build.data.weapon}
                                miniMode={!!miniMode}
                            />
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
                                    <Chip label={`+${perkData.count} ${perkData.name}`} />
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
