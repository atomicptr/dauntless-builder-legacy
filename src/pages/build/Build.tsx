import { Grid } from "@mui/material";
import React, { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

import ItemPicker from "../../components/item-picker/ItemPicker";
import PageTitle from "../../components/page-title/PageTitle";
import { BuildModel } from "../../data/BuildModel";
import { CellType } from "../../data/Cell";
import { ItemType } from "../../data/ItemType";
import { selectBuild, setBuildId } from "../../features/build/build-slice";
import { useAppDispatch, useAppSelector } from "../../hooks/redux";

const Build: React.FC = () => {
    const { buildId } = useParams();
    const navigate = useNavigate();

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
                title={`${build.weaponName} Build`}
                hidden
            />

            <Grid
                container
                spacing={2}>
                <Grid
                    item
                    sm={12}
                    md={9}>
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
                    Perks
                </Grid>
            </Grid>
        </>
    );
};

export default Build;
