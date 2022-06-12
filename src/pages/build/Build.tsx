import { Grid, ListSubheader, Typography } from "@mui/material";
import BondWeaponPicker from "@src/components/BondWeaponPicker";
import BuildWarning from "@src/components/BuildWarning";
import CellPicker from "@src/components/CellPicker";
import CellSelectDialog from "@src/components/CellSelectDialog";
import CellSlotFilter from "@src/components/CellSlotFilter";
import ElementalTypeFilter from "@src/components/ElementalTypeFilter";
import GenericItemSelectDialog, { GenericItem } from "@src/components/GenericItemSelectDialog";
import ItemPicker, { ItemPickerItem } from "@src/components/ItemPicker";
import ItemSelectDialog, {
    filterByArmourType,
    filterByElement,
    filterByWeaponType,
    FilterFunc,
    filterRemoveBondWeapons,
} from "@src/components/ItemSelectDialog";
import OmnicellCard from "@src/components/OmnicellCard";
import PageTitle from "@src/components/PageTitle";
import PartPicker from "@src/components/PartPicker";
import PerkFilter from "@src/components/PerkFilter";
import PerkList from "@src/components/PerkList";
import PerkListMobile from "@src/components/PerkListMobile";
import UniqueEffectCard from "@src/components/UniqueEffectCard";
import WeaponTypeFilter from "@src/components/WeaponTypeFilter";
import { Armour, ArmourType } from "@src/data/Armour";
import { BuildModel, findPartSlotName } from "@src/data/BuildModel";
import { CellType } from "@src/data/Cell";
import { isExotic } from "@src/data/ItemRarity";
import { isArmourType, ItemType } from "@src/data/ItemType";
import { Lantern } from "@src/data/Lantern";
import { Omnicell } from "@src/data/Omnicell";
import { Part, partBuildIdentifier, PartType, partTypeData } from "@src/data/Part";
import { Weapon, weaponBuildIdentifier, WeaponType } from "@src/data/Weapon";
import { selectBuild, setBuildId, updateBuild } from "@src/features/build/build-slice";
import { resetFilter, setWeaponTypeFilter } from "@src/features/item-select-filter/item-select-filter-slice";
import useIsMobile from "@src/hooks/is-mobile";
import { useAppDispatch, useAppSelector } from "@src/hooks/redux";
import { defaultBuildName } from "@src/utils/default-build-name";
import { itemTranslationIdentifier } from "@src/utils/item-translation-identifier";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import { match } from "ts-pattern";

interface PickerSelection {
    itemType: ItemType;
    filters: FilterFunc[];
    cell?: {
        index: number;
        type: CellType;
    };
    part?: {
        partType: PartType;
        weaponType: WeaponType;
    };
}

const Build: React.FC = () => {
    const { buildId } = useParams();
    const { t } = useTranslation();
    const navigate = useNavigate();
    const isMobile = useIsMobile();

    const dispatch = useAppDispatch();
    const build = useAppSelector(selectBuild);

    const [itemDialogOpen, setItemDialogOpen] = useState<boolean>(false);
    const [cellDialogOpen, setCellDialogOpen] = useState<boolean>(false);
    const [partDialogOpen, setPartDialogOpen] = useState<boolean>(false);
    const [bondDialogOpen, setBondDialogOpen] = useState<boolean>(false);
    const [pickerSelection, setPickerSelection] = useState<PickerSelection>({ filters: [], itemType: ItemType.Weapon });

    useEffect(() => {
        const build = BuildModel.tryDeserialize(buildId ?? null);
        dispatch(setBuildId(build.serialize()));
    }, [buildId, dispatch]);

    useEffect(() => {
        navigate(`/b/${build.serialize()}`);
    }, [build, navigate]);

    if (!buildId || !BuildModel.isValid(buildId)) {
        navigate("/b/new");
        return null;
    }

    const onItemPickerClicked = (itemType: ItemType) => {
        console.log("clicked", itemType);

        const filters = match(itemType)
            .with(ItemType.Weapon, () => [])
            .with(ItemType.Head, () => [filterByArmourType(ArmourType.Head)])
            .with(ItemType.Torso, () => [filterByArmourType(ArmourType.Torso)])
            .with(ItemType.Arms, () => [filterByArmourType(ArmourType.Arms)])
            .with(ItemType.Legs, () => [filterByArmourType(ArmourType.Legs)])
            .otherwise(() => []);

        setPickerSelection({ filters, itemType });
        setItemDialogOpen(true);
    };

    const onItemPickerItemSelected = (item: ItemPickerItem, itemType: ItemType, isPowerSurged: boolean) => {
        dispatch(resetFilter());

        if (item !== null && itemType === ItemType.Weapon) {
            dispatch(setWeaponTypeFilter([(item as Weapon).type]));
        }

        const buildUpdates = match(itemType)
            .with(ItemType.Weapon, () => ({ weaponName: (item as Weapon)?.name, weaponSurged: isPowerSurged }))
            .with(ItemType.Head, () => ({ headName: (item as Armour)?.name, headSurged: isPowerSurged }))
            .with(ItemType.Torso, () => ({ torsoName: (item as Armour)?.name, torsoSurged: isPowerSurged }))
            .with(ItemType.Arms, () => ({ armsName: (item as Armour)?.name, armsSurged: isPowerSurged }))
            .with(ItemType.Legs, () => ({ legsName: (item as Armour)?.name, legsSurged: isPowerSurged }))
            .with(ItemType.Lantern, () => ({ lantern: (item as Lantern)?.name }))
            .with(ItemType.Omnicell, () => ({ omnicell: (item as Omnicell)?.name }))
            .otherwise(() => ({}));

        dispatch(updateBuild({ ...buildUpdates }));
        setItemDialogOpen(false);
    };

    const onCellClicked = (itemType: ItemType, cellType: CellType, index: number) => {
        setPickerSelection({ cell: { index, type: cellType }, filters: [], itemType });
        setCellDialogOpen(true);
    };

    const onCellPickerItemSelected = (variant: string, itemType: ItemType, index: number) => {
        const buildUpdates = match(itemType)
            .with(ItemType.Weapon, () => {
                if (index === 0) {
                    return { weaponCell1: variant };
                }
                return { weaponCell2: variant };
            })
            .with(ItemType.Head, () => ({ headCell: variant }))
            .with(ItemType.Torso, () => ({ torsoCell: variant }))
            .with(ItemType.Arms, () => ({ armsCell: variant }))
            .with(ItemType.Legs, () => ({ legsCell: variant }))
            .with(ItemType.Lantern, () => ({ lanternCell: variant }))
            .otherwise(() => ({}));

        dispatch(updateBuild({ ...buildUpdates }));
        setCellDialogOpen(false);
    };

    const onPartClicked = (partType: PartType) => {
        if (!build.data.weapon) {
            return;
        }

        setPickerSelection({
            filters: [],
            itemType: ItemType.Part,
            part: {
                partType,
                weaponType: build.data.weapon.type,
            },
        });
        setPartDialogOpen(true);
    };

    const onPartItemSelected = (item: GenericItem | null) => {
        if (!pickerSelection.part) {
            return;
        }

        const slotName = findPartSlotName(pickerSelection.part.weaponType, pickerSelection.part.partType);

        if (!slotName) {
            return;
        }

        dispatch(updateBuild({ [slotName]: item?.name ?? null }));
        setPartDialogOpen(false);
    };

    const onBondWeaponClicked = () => {
        if (!build.data.weapon || !build.data.weapon.bond?.elemental) {
            return;
        }

        setPickerSelection({
            filters: [
                filterByWeaponType(build.data.weapon.type),
                filterByElement(build.data.weapon.bond.elemental),
                filterRemoveBondWeapons(),
            ],
            itemType: ItemType.Weapon,
        });
        setBondDialogOpen(true);
    };

    const onBondWeaponSelected = (item: GenericItem | null) => {
        dispatch(updateBuild({ bondWeapon: item?.name ?? null }));
        setBondDialogOpen(false);
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
                        .run()}
                />
            ) : null,
        );

    const renderArmourUniqueEffects = (powerSurged: boolean) => (item: ItemPickerItem, type: ItemType) =>
        (item as Armour).unique_effects
            ?.filter(ue => (ue.powerSurged !== undefined ? ue.powerSurged === powerSurged : true))
            .map((ue, index) => (
                <UniqueEffectCard
                    key={index}
                    index={index}
                    item={item as Armour}
                    itemType={type}
                    uniqueEffect={ue}
                />
            ));

    const buildName = defaultBuildName(build);

    return (
        <>
            <PageTitle
                hidden
                title={buildName}
            />

            <BuildWarning />

            <Grid
                container
                spacing={2}
                sx={{ pb: 10 }}
            >
                <Grid
                    item
                    md={9}
                    sm={12}
                >
                    <ListSubheader sx={{ userSelect: "none" }}>{buildName}</ListSubheader>

                    <ItemPicker
                        componentsBelow={() => <OmnicellCard item={build.data.omnicell} />}
                        item={build.data.omnicell}
                        onClick={onItemPickerClicked}
                        type={ItemType.Omnicell}
                    />
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
                                            uniqueEffect={ue}
                                        />
                                    ))}

                                <BondWeaponPicker
                                    bondWeapon={build.data.bondWeapon}
                                    onClick={onBondWeaponClicked}
                                    parentWeapon={build.data.weapon}
                                    parentWeaponPowerSurged={build.weaponSurged}
                                />

                                {!isExotic(item as Weapon) ? (
                                    (item as Weapon).type === WeaponType.Repeater ? (
                                        <>
                                            <PartPicker
                                                item={build.data.parts?.chamber ?? null}
                                                onClick={onPartClicked}
                                                type={PartType.Chamber}
                                                weaponType={build.data.weapon?.type ?? null}
                                            />
                                            <PartPicker
                                                item={build.data.parts?.grip ?? null}
                                                onClick={onPartClicked}
                                                type={PartType.Grip}
                                                weaponType={build.data.weapon?.type ?? null}
                                            />
                                        </>
                                    ) : (
                                        <PartPicker
                                            item={build.data.parts?.special ?? null}
                                            onClick={onPartClicked}
                                            type={PartType.Special}
                                            weaponType={build.data.weapon?.type ?? null}
                                        />
                                    )
                                ) : null}
                                <PartPicker
                                    item={build.data.parts?.mod ?? null}
                                    onClick={onPartClicked}
                                    type={PartType.Mod}
                                    weaponType={build.data.weapon?.type ?? null}
                                />
                            </>
                        )}
                        componentsOnSide={renderCellSlots}
                        isPowerSurged={build.weaponSurged}
                        item={build.data.weapon}
                        onClick={onItemPickerClicked}
                        type={ItemType.Weapon}
                    />
                    <ItemPicker
                        componentsBelow={renderArmourUniqueEffects(build.headSurged)}
                        componentsOnSide={renderCellSlots}
                        isPowerSurged={build.headSurged}
                        item={build.data.head}
                        onClick={onItemPickerClicked}
                        type={ItemType.Head}
                    />
                    <ItemPicker
                        componentsBelow={renderArmourUniqueEffects(build.torsoSurged)}
                        componentsOnSide={renderCellSlots}
                        isPowerSurged={build.torsoSurged}
                        item={build.data.torso}
                        onClick={onItemPickerClicked}
                        type={ItemType.Torso}
                    />
                    <ItemPicker
                        componentsBelow={renderArmourUniqueEffects(build.armsSurged)}
                        componentsOnSide={renderCellSlots}
                        isPowerSurged={build.armsSurged}
                        item={build.data.arms}
                        onClick={onItemPickerClicked}
                        type={ItemType.Arms}
                    />
                    <ItemPicker
                        componentsBelow={renderArmourUniqueEffects(build.legsSurged)}
                        componentsOnSide={renderCellSlots}
                        isPowerSurged={build.legsSurged}
                        item={build.data.legs}
                        onClick={onItemPickerClicked}
                        type={ItemType.Legs}
                    />
                    <ItemPicker
                        componentsOnSide={renderCellSlots}
                        item={build.data.lantern}
                        onClick={onItemPickerClicked}
                        type={ItemType.Lantern}
                    />
                </Grid>
                <Grid
                    item
                    md={3}
                    sm={12}
                    sx={{ width: isMobile ? "100%" : undefined }}
                >
                    {isMobile ? <PerkListMobile /> : <PerkList />}
                </Grid>
            </Grid>

            <ItemSelectDialog
                filterComponents={(itemType: ItemType) => (
                    <>
                        {itemType === ItemType.Weapon ? <WeaponTypeFilter /> : null}

                        {itemType === ItemType.Weapon || isArmourType(itemType) ? (
                            <>
                                <ElementalTypeFilter itemType={itemType} />

                                <PerkFilter itemType={itemType} />

                                <CellSlotFilter itemType={itemType} />
                            </>
                        ) : null}
                    </>
                )}
                handleClose={() => setItemDialogOpen(false)}
                itemType={pickerSelection.itemType}
                onItemSelected={onItemPickerItemSelected}
                open={itemDialogOpen}
                preDefinedFilters={pickerSelection.filters}
            />

            <CellSelectDialog
                cellIndex={pickerSelection.cell?.index ?? null}
                cellType={pickerSelection.cell?.type ?? null}
                handleClose={() => setCellDialogOpen(false)}
                itemType={pickerSelection.itemType}
                onCellSelected={onCellPickerItemSelected}
                open={cellDialogOpen}
            />

            {build.data.weapon && pickerSelection.part ? (
                <GenericItemSelectDialog
                    componentsInside={(item, itemType) => {
                        if (!build.data.weapon || !pickerSelection.part) {
                            return null;
                        }

                        const weaponIdent = weaponBuildIdentifier(build.data.weapon.type);
                        const partIdent = partBuildIdentifier(pickerSelection.part.partType);

                        return (
                            <>
                                <Typography
                                    component="div"
                                    sx={{ alignItems: "center", display: "flex", mb: 1 }}
                                    variant="h5"
                                >
                                    {t(itemTranslationIdentifier(itemType, weaponIdent, partIdent, item.name, "name"))}
                                </Typography>

                                {(item as Part).part_effect.map((_, index) => (
                                    <Typography key={index}>
                                        {t(
                                            itemTranslationIdentifier(
                                                itemType,
                                                weaponIdent,
                                                partIdent,
                                                item.name,
                                                "part_effect",
                                                index.toString(),
                                            ),
                                        )}
                                    </Typography>
                                ))}
                            </>
                        );
                    }}
                    handleClose={() => setPartDialogOpen(false)}
                    itemType={ItemType.Part}
                    items={Object.values(partTypeData(build.data.weapon.type, pickerSelection.part.partType))}
                    onItemSelected={onPartItemSelected}
                    open={partDialogOpen}
                    title={t("pages.build.part-select-dialog-title")}
                />
            ) : null}

            <ItemSelectDialog
                disableComponentsInside
                disablePowerSurgeSelection
                disableUniqueEffectDisplay
                handleClose={() => setBondDialogOpen(false)}
                itemType={ItemType.Weapon}
                onItemSelected={onBondWeaponSelected}
                open={bondDialogOpen}
                preDefinedFilters={pickerSelection.filters}
            />
        </>
    );
};

export default Build;
