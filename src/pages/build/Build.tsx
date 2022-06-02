import { Grid, ListSubheader } from "@mui/material";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import { match } from "ts-pattern";

import BondWeaponPicker from "../../components/item-picker/BondWeaponPicker";
import CellPicker from "../../components/item-picker/CellPicker";
import ItemPicker, { ItemPickerItem } from "../../components/item-picker/ItemPicker";
import OmnicellCard from "../../components/item-picker/OmnicellCard";
import PartPicker from "../../components/item-picker/PartPicker";
import UniqueEffectCard from "../../components/item-picker/UniqueEffectCard";
import { filterByArmourType, filterByWeaponType } from "../../components/item-select-dialog/filters";
import ItemSelectDialog, { FilterFunc } from "../../components/item-select-dialog/ItemSelectDialog";
import PageTitle from "../../components/page-title/PageTitle";
import MobilePerkList from "../../components/perk-list/MobilePerkList";
import PerkList from "../../components/perk-list/PerkList";
import { Armour, ArmourType } from "../../data/Armour";
import { BuildModel } from "../../data/BuildModel";
import { CellType } from "../../data/Cell";
import { isExotic } from "../../data/ItemRarity";
import { ItemType } from "../../data/ItemType";
import { Lantern } from "../../data/Lantern";
import { Omnicell } from "../../data/Omnicell";
import { PartType } from "../../data/Part";
import { Weapon, WeaponType } from "../../data/Weapon";
import { selectBuild, setBuildId, updateBuild } from "../../features/build/build-slice";
import useIsMobile from "../../hooks/is-mobile";
import { useAppDispatch, useAppSelector } from "../../hooks/redux";

interface PickerSelection {
    itemType: ItemType;
    filters: FilterFunc[];
}

const Build: React.FC = () => {
    const { buildId } = useParams();
    const navigate = useNavigate();
    const isMobile = useIsMobile();
    const { t } = useTranslation();

    if (!buildId || !BuildModel.isValid(buildId)) {
        navigate("/b/new");
        return null;
    }

    const dispatch = useAppDispatch();
    const build = useAppSelector(selectBuild);

    const [dialogOpen, setDialogOpen] = useState<boolean>(false);
    const [pickerSelection, setPickerSelection] = useState<PickerSelection>({ filters: [], itemType: ItemType.Weapon });

    useEffect(() => {
        // TODO: update to new version if necessary
        // TODO: update url path
        const build = BuildModel.tryDeserialize(buildId);
        dispatch(setBuildId(build.serialize()));
    }, []);

    useEffect(() => {
        navigate(`/b/${build.serialize()}`);
    }, [build]);

    const onItemPickerClicked = (itemType: ItemType) => {
        console.log("clicked", itemType);

        const filters = match(itemType)
            .with(ItemType.Weapon, () => (build.data.weapon ? [filterByWeaponType(build.data.weapon.type)] : []))
            .with(ItemType.Head, () => [filterByArmourType(ArmourType.Head)])
            .with(ItemType.Torso, () => [filterByArmourType(ArmourType.Torso)])
            .with(ItemType.Arms, () => [filterByArmourType(ArmourType.Arms)])
            .with(ItemType.Legs, () => [filterByArmourType(ArmourType.Legs)])
            .otherwise(() => []);

        setPickerSelection({ filters, itemType });
        setDialogOpen(true);
    };

    const onItemPickerItemSelected = (item: ItemPickerItem, itemType: ItemType, isPowerSurged: boolean) => {
        console.log("selected", item);

        const buildUpdates = match(itemType)
            .with(ItemType.Weapon, () => ({ weaponName: (item as Weapon).name, weaponSurged: isPowerSurged }))
            .with(ItemType.Head, () => ({ headName: (item as Armour).name, headSurged: isPowerSurged }))
            .with(ItemType.Torso, () => ({ torsoName: (item as Armour).name, torsoSurged: isPowerSurged }))
            .with(ItemType.Arms, () => ({ armsName: (item as Armour).name, armsSurged: isPowerSurged }))
            .with(ItemType.Legs, () => ({ legsName: (item as Armour).name, legsSurged: isPowerSurged }))
            .with(ItemType.Lantern, () => ({ lantern: (item as Lantern).name }))
            .with(ItemType.Omnicell, () => ({ omnicell: (item as Omnicell).name }))
            .otherwise(() => ({}));

        console.log(buildUpdates);

        dispatch(updateBuild({ ...buildUpdates }));
        setDialogOpen(false);
    };

    const onCellClicked = (itemType: ItemType, cellType: CellType, index: number) => {
        console.log("clicked", itemType, cellType, index);
    };

    const onPartClicked = (partType: PartType) => {
        console.log("clicked", partType);
    };

    const onBondWeaponClicked = () => {
        console.log("clicked bond weapon");
    };

    const renderCellSlots = (item: ItemPickerItem, type: ItemType) =>
        (Array.isArray((item as Weapon | Armour | Lantern | null)?.cells)
            ? ((item as Weapon | Armour | Lantern | null)?.cells as CellType[]) ?? []
            : [(item as Weapon | Armour | Lantern | null)?.cells]
        ).map((cellType, index) =>
            cellType ? (
                <CellPicker
                    key={index}
                    cellType={cellType as CellType}
                    index={index}
                    itemType={type}
                    onClicked={onCellClicked}
                    variant={match<ItemType, string | null>(type)
                        .with(ItemType.Weapon, () => (index === 0 ? build.weaponCell1 : build.weaponCell2))
                        .with(ItemType.Head, () => build.headCell)
                        .with(ItemType.Torso, () => build.torsoCell)
                        .with(ItemType.Arms, () => build.armsCell)
                        .with(ItemType.Legs, () => build.legsCell)
                        .with(ItemType.Lantern, () => build.lanternCell)
                        .run()} />
            ) : null,
        );

    const renderArmourUniqueEffects = (powerSurged: boolean) => (item: ItemPickerItem, type: ItemType) =>
        (
            <>
                {(item as Armour).unique_effects
                    ?.filter(ue => (ue.powerSurged !== undefined ? ue.powerSurged === powerSurged : true))
                    .map((ue, index) => (
                        <UniqueEffectCard
                            key={index}
                            index={index}
                            item={item as Armour}
                            itemType={type}
                            uniqueEffect={ue} />
                    ))}
            </>
        );

    return (
        <>
            <PageTitle
                hidden
                title={t("pages.build.title", { ...build })} />

            <Grid
                container
                spacing={2}
                sx={{ pb: 10 }}>
                <Grid
                    item
                    md={9}
                    sm={12}>
                    <ListSubheader
                        sx={{ userSelect: "none" }}>{t("pages.build.title", { ...build })}
                    </ListSubheader>

                    <ItemPicker
                        componentsBelow={() => <OmnicellCard
                            item={build.data.omnicell} />}
                        item={build.data.omnicell}
                        onClick={onItemPickerClicked}
                        type={ItemType.Omnicell} />
                    <ItemPicker
                        componentsBelow={(item, type) => (
                            <>
                                {(item as Weapon).unique_effects
                                    ?.filter(ue =>
                                        ue.powerSurged !== undefined ? ue.powerSurged === build.weaponSurged : true,
                                    )
                                    .map((ue, index) => (
                                        <UniqueEffectCard
                                            key={index}
                                            index={index}
                                            item={item as Weapon}
                                            itemType={type}
                                            uniqueEffect={ue} />
                                    ))}

                                <BondWeaponPicker
                                    bondWeapon={build.data.bondWeapon}
                                    onClick={onBondWeaponClicked}
                                    parentWeapon={build.data.weapon}
                                    parentWeaponPowerSurged={build.weaponSurged} />

                                {!isExotic(item as Weapon) ? (
                                    (item as Weapon).type === WeaponType.Repeater ? (
                                        <>
                                            <PartPicker
                                                item={build.data.parts?.chamber ?? null}
                                                onClick={onPartClicked}
                                                type={PartType.Chamber}
                                                weaponType={build.data.weapon?.type ?? null} />
                                            <PartPicker
                                                item={build.data.parts?.grip ?? null}
                                                onClick={onPartClicked}
                                                type={PartType.Grip}
                                                weaponType={build.data.weapon?.type ?? null} />
                                        </>
                                    ) : (
                                        <PartPicker
                                            item={build.data.parts?.special ?? null}
                                            onClick={onPartClicked}
                                            type={PartType.Special}
                                            weaponType={build.data.weapon?.type ?? null} />
                                    )
                                ) : null}
                                <PartPicker
                                    item={build.data.parts?.mod ?? null}
                                    onClick={onPartClicked}
                                    type={PartType.Mod}
                                    weaponType={build.data.weapon?.type ?? null} />
                            </>
                        )}
                        componentsOnSide={renderCellSlots}
                        isPowerSurged={build.weaponSurged}
                        item={build.data.weapon}
                        onClick={onItemPickerClicked}
                        type={ItemType.Weapon} />
                    <ItemPicker
                        componentsBelow={renderArmourUniqueEffects(build.headSurged)}
                        componentsOnSide={renderCellSlots}
                        isPowerSurged={build.headSurged}
                        item={build.data.head}
                        onClick={onItemPickerClicked}
                        type={ItemType.Head} />
                    <ItemPicker
                        componentsBelow={renderArmourUniqueEffects(build.torsoSurged)}
                        componentsOnSide={renderCellSlots}
                        isPowerSurged={build.torsoSurged}
                        item={build.data.torso}
                        onClick={onItemPickerClicked}
                        type={ItemType.Torso} />
                    <ItemPicker
                        componentsBelow={renderArmourUniqueEffects(build.armsSurged)}
                        componentsOnSide={renderCellSlots}
                        isPowerSurged={build.armsSurged}
                        item={build.data.arms}
                        onClick={onItemPickerClicked}
                        type={ItemType.Arms} />
                    <ItemPicker
                        componentsBelow={renderArmourUniqueEffects(build.legsSurged)}
                        componentsOnSide={renderCellSlots}
                        isPowerSurged={build.legsSurged}
                        item={build.data.legs}
                        onClick={onItemPickerClicked}
                        type={ItemType.Legs} />
                    <ItemPicker
                        componentsOnSide={renderCellSlots}
                        item={build.data.lantern}
                        onClick={onItemPickerClicked}
                        type={ItemType.Lantern} />
                </Grid>
                <Grid
                    item
                    md={3}
                    sm={12}
                    sx={{ width: isMobile ? "100%" : undefined }}>
                    {isMobile ? <MobilePerkList /> : <PerkList />}
                </Grid>
            </Grid>

            <ItemSelectDialog
                filters={pickerSelection.filters}
                handleClose={() => setDialogOpen(false)}
                itemType={pickerSelection.itemType}
                onItemSelected={onItemPickerItemSelected}
                open={dialogOpen} />
        </>
    );
};

export default Build;
