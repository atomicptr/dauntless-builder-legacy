import { Grid, ListSubheader } from "@mui/material";
import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";

import ItemPicker from "../../components/item-picker/ItemPicker";
import PageTitle from "../../components/page-title/PageTitle";
import PerkList from "../../components/perk-list/PerkList";
import { BuildModel } from "../../data/BuildModel";
import { CellType } from "../../data/Cell";
import { ItemType } from "../../data/ItemType";
import { selectBuild, setBuildId } from "../../features/build/build-slice";
import { useAppDispatch, useAppSelector } from "../../hooks/redux";

const Build: React.FC = () => {
    const { buildId } = useParams();
    const navigate = useNavigate();
    const { t } = useTranslation();

    if (!buildId || !BuildModel.isValid(buildId)) {
        navigate("/b/new");
        return null;
    }

    const dispatch = useAppDispatch();
    const build = useAppSelector(selectBuild);

    useEffect(() => {
        // TODO: update to new version if necessary
        // TODO: update url path
        const build = BuildModel.tryDeserialize(buildId);
        dispatch(setBuildId(build.serialize()));
    }, []);

    const onItemPickerClicked = (itemType: ItemType) => {
        console.log("clicked", itemType);
    };

    const onCellClicked = (itemType: ItemType, cellType: CellType, index: number) => {
        console.log("clicked", itemType, cellType, index);
    };

    return (
        <>
            <PageTitle
                title={t("pages.build.title", { ...build })}
                hidden
            />

            <Grid
                container
                spacing={2}
                sx={{ pb: 10 }}>
                <Grid
                    item
                    sm={12}
                    md={9}>
                    <ListSubheader sx={{ userSelect: "none" }}>{t("pages.build.title", { ...build })}</ListSubheader>

                    <ItemPicker
                        type={ItemType.Omnicell}
                        onClick={onItemPickerClicked}
                    />
                    <ItemPicker
                        type={ItemType.Weapon}
                        onClick={onItemPickerClicked}
                        withCellPicker
                        onCellClicked={onCellClicked}
                    />
                    <ItemPicker
                        type={ItemType.Head}
                        onClick={onItemPickerClicked}
                        withCellPicker
                        onCellClicked={onCellClicked}
                    />
                    <ItemPicker
                        type={ItemType.Torso}
                        onClick={onItemPickerClicked}
                        withCellPicker
                        onCellClicked={onCellClicked}
                    />
                    <ItemPicker
                        type={ItemType.Arms}
                        onClick={onItemPickerClicked}
                        withCellPicker
                        onCellClicked={onCellClicked}
                    />
                    <ItemPicker
                        type={ItemType.Legs}
                        onClick={onItemPickerClicked}
                        withCellPicker
                        onCellClicked={onCellClicked}
                    />
                    <ItemPicker
                        type={ItemType.Lantern}
                        onClick={onItemPickerClicked}
                        withCellPicker
                        onCellClicked={onCellClicked}
                    />
                </Grid>
                <Grid
                    item
                    sm={12}
                    md={3}>
                    <PerkList />
                </Grid>
            </Grid>
        </>
    );
};

export default Build;
