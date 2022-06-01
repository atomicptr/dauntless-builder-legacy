import { Grid, ListSubheader } from "@mui/material";
import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";

import BondWeaponPicker from "../../components/item-picker/BondWeaponPicker";
import CellPicker from "../../components/item-picker/CellPicker";
import ItemPicker, { ItemPickerItem } from "../../components/item-picker/ItemPicker";
import OmnicellCard from "../../components/item-picker/OmnicellCard";
import PartPicker from "../../components/item-picker/PartPicker";
import UniqueEffectCard from "../../components/item-picker/UniqueEffectCard";
import PageTitle from "../../components/page-title/PageTitle";
import MobilePerkList from "../../components/perk-list/MobilePerkList";
import PerkList from "../../components/perk-list/PerkList";
import { Armour } from "../../data/Armour";
import { BuildModel } from "../../data/BuildModel";
import { CellType } from "../../data/Cell";
import { isExotic } from "../../data/ItemRarity";
import { ItemType } from "../../data/ItemType";
import { Lantern } from "../../data/Lantern";
import { PartType } from "../../data/Part";
import { Weapon, WeaponType } from "../../data/Weapon";
import { selectBuild, setBuildId } from "../../features/build/build-slice";
import useIsMobile from "../../hooks/is-mobile";
import { useAppDispatch, useAppSelector } from "../../hooks/redux";

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
                    index={index}
                    itemType={type}
                    cellType={cellType as CellType}
                    onClicked={onCellClicked}
                />
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
                            uniqueEffect={ue}
                            item={item as Armour}
                            itemType={type}
                        />
                    ))}
            </>
        );

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
                        item={build.data.omnicell}
                        onClick={onItemPickerClicked}
                        componentsBelow={() => <OmnicellCard item={build.data.omnicell} />}
                    />
                    <ItemPicker
                        type={ItemType.Weapon}
                        item={build.data.weapon}
                        isPowerSurged={build.weaponSurged}
                        onClick={onItemPickerClicked}
                        componentsOnSide={renderCellSlots}
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
                                            uniqueEffect={ue}
                                            item={item as Weapon}
                                            itemType={type}
                                        />
                                    ))}

                                <BondWeaponPicker
                                    parentWeapon={build.data.weapon}
                                    parentWeaponPowerSurged={build.weaponSurged}
                                    bondWeapon={build.data.bondWeapon}
                                    onClick={onBondWeaponClicked}
                                />

                                {!isExotic(item as Weapon) ? (
                                    (item as Weapon).type === WeaponType.Repeater ? (
                                        <>
                                            <PartPicker
                                                type={PartType.Chamber}
                                                item={build.data.parts?.chamber ?? null}
                                                weaponType={build.data.weapon?.type ?? null}
                                                onClick={onPartClicked}
                                            />
                                            <PartPicker
                                                type={PartType.Grip}
                                                item={build.data.parts?.grip ?? null}
                                                weaponType={build.data.weapon?.type ?? null}
                                                onClick={onPartClicked}
                                            />
                                        </>
                                    ) : (
                                        <PartPicker
                                            type={PartType.Special}
                                            item={build.data.parts?.special ?? null}
                                            weaponType={build.data.weapon?.type ?? null}
                                            onClick={onPartClicked}
                                        />
                                    )
                                ) : null}
                                <PartPicker
                                    type={PartType.Mod}
                                    item={build.data.parts?.mod ?? null}
                                    weaponType={build.data.weapon?.type ?? null}
                                    onClick={onPartClicked}
                                />
                            </>
                        )}
                    />
                    <ItemPicker
                        item={build.data.head}
                        type={ItemType.Head}
                        isPowerSurged={build.headSurged}
                        onClick={onItemPickerClicked}
                        componentsOnSide={renderCellSlots}
                        componentsBelow={renderArmourUniqueEffects(build.headSurged)}
                    />
                    <ItemPicker
                        type={ItemType.Torso}
                        item={build.data.torso}
                        isPowerSurged={build.torsoSurged}
                        onClick={onItemPickerClicked}
                        componentsOnSide={renderCellSlots}
                        componentsBelow={renderArmourUniqueEffects(build.torsoSurged)}
                    />
                    <ItemPicker
                        type={ItemType.Arms}
                        item={build.data.arms}
                        isPowerSurged={build.armsSurged}
                        onClick={onItemPickerClicked}
                        componentsOnSide={renderCellSlots}
                        componentsBelow={renderArmourUniqueEffects(build.armsSurged)}
                    />
                    <ItemPicker
                        type={ItemType.Legs}
                        item={build.data.legs}
                        isPowerSurged={build.legsSurged}
                        onClick={onItemPickerClicked}
                        componentsOnSide={renderCellSlots}
                        componentsBelow={renderArmourUniqueEffects(build.legsSurged)}
                    />
                    <ItemPicker
                        type={ItemType.Lantern}
                        item={build.data.lantern}
                        onClick={onItemPickerClicked}
                        componentsOnSide={renderCellSlots}
                    />
                </Grid>
                <Grid
                    item
                    sm={12}
                    md={3}
                    sx={{ width: isMobile ? "100%" : undefined }}>
                    {isMobile ? <MobilePerkList /> : <PerkList />}
                </Grid>
            </Grid>
        </>
    );
};

export default Build;
