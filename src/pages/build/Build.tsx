import {
    Box,
    FormControl,
    Grid,
    InputLabel,
    ListItemIcon,
    ListItemText,
    ListSubheader,
    MenuItem,
    Select,
    Stack,
} from "@mui/material";
import BondWeaponPicker from "@src/components/bond-weapon-picker/BondWeaponPicker";
import CellPicker from "@src/components/cell-picker/CellPicker";
import CellSelectDialog from "@src/components/cell-select-dialog/CellSelectDialog";
import ItemPicker, { ItemPickerItem } from "@src/components/item-picker/ItemPicker";
import { filterByArmourType } from "@src/components/item-select-dialog/filters";
import ItemSelectDialog, { FilterFunc } from "@src/components/item-select-dialog/ItemSelectDialog";
import OmnicellCard from "@src/components/omnicell-card/OmnicellCard";
import PageTitle from "@src/components/page-title/PageTitle";
import PartPicker from "@src/components/part-picker/PartPicker";
import MobilePerkList from "@src/components/perk-list/MobilePerkList";
import PerkList from "@src/components/perk-list/PerkList";
import UniqueEffectCard from "@src/components/unique-effect-card/UniqueEffectCard";
import { Armour, ArmourType } from "@src/data/Armour";
import { BuildModel } from "@src/data/BuildModel";
import { CellType } from "@src/data/Cell";
import { ElementalType } from "@src/data/ElementalType";
import { isExotic } from "@src/data/ItemRarity";
import { isArmourType, ItemType } from "@src/data/ItemType";
import { Lantern } from "@src/data/Lantern";
import { Omnicell } from "@src/data/Omnicell";
import { PartType } from "@src/data/Part";
import { Weapon, WeaponType } from "@src/data/Weapon";
import { selectBuild, setBuildId, updateBuild } from "@src/features/build/build-slice";
import {
    ElementFilterItemTypes,
    resetFilter,
    selectItemSelectFilter,
    selectWeaponFilter,
    setElementFilter,
    setWeaponTypeFilter,
} from "@src/features/item-select-filter/item-select-filter-slice";
import useIsMobile from "@src/hooks/is-mobile";
import { useAppDispatch, useAppSelector } from "@src/hooks/redux";
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
}

const Build: React.FC = () => {
    const { buildId } = useParams();
    const navigate = useNavigate();
    const isMobile = useIsMobile();
    const { t } = useTranslation();

    const dispatch = useAppDispatch();
    const build = useAppSelector(selectBuild);

    const [itemDialogOpen, setItemDialogOpen] = useState<boolean>(false);
    const [cellDialogOpen, setCellDialogOpen] = useState<boolean>(false);
    const [pickerSelection, setPickerSelection] = useState<PickerSelection>({ filters: [], itemType: ItemType.Weapon });

    const weaponFilter = useAppSelector(selectWeaponFilter);
    const itemSelectFilter = useAppSelector(selectItemSelectFilter);

    useEffect(() => {
        // TODO: update to new version if necessary
        // TODO: update url path
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
                filterComponents={(itemType: ItemType) => (
                    <>
                        {itemType === ItemType.Weapon ? (
                            <>
                                <FormControl
                                    fullWidth>
                                    <InputLabel>
                                        {t("pages.build.filter-by", { name: t("terms.weapon-type") })}
                                    </InputLabel>
                                    <Select
                                        multiple
                                        onChange={ev => dispatch(setWeaponTypeFilter(ev.target.value as WeaponType[]))}
                                        value={weaponFilter.weaponType}
                                        variant="standard">
                                        {Object.keys(WeaponType)
                                            .sort()
                                            .map(weaponType => (
                                                <MenuItem
                                                    key={weaponType}
                                                    value={WeaponType[weaponType as keyof typeof WeaponType]}>
                                                    {t(`terms.weapon-types.${weaponType}`)}
                                                </MenuItem>
                                            ))}
                                    </Select>
                                </FormControl>
                            </>
                        ) : null}

                        {itemType === ItemType.Weapon || isArmourType(itemType) ? (
                            <FormControl
                                fullWidth>
                                <InputLabel>
                                    {t("pages.build.filter-by", { name: t("terms.elemental-type") })}
                                </InputLabel>
                                <Select
                                    multiple
                                    onChange={ev =>
                                        dispatch(setElementFilter([itemType, ev.target.value as ElementalType[]]))
                                    }
                                    renderValue={selected => (
                                        <Stack
                                            direction="row"
                                            spacing={1}>
                                            {selected.map((elementalType, index) => (
                                                <Stack
                                                    key={index}
                                                    component="span"
                                                    direction="row"
                                                    spacing={0.5}
                                                    sx={{ alignItems: "center", display: "flex" }}>
                                                    <img
                                                        src={`/assets/icons/elements/${elementalType}.png`}
                                                        style={{ height: "16px", width: "16px" }} />
                                                    <Box
                                                        component="span">
                                                        {t(`terms.elemental-types.${elementalType}`)}
                                                        {index !== selected.length - 1 ? ", " : ""}
                                                    </Box>
                                                </Stack>
                                            ))}
                                        </Stack>
                                    )}
                                    value={itemSelectFilter[itemType as ElementFilterItemTypes].elementType}
                                    variant="standard">
                                    {Object.keys(ElementalType)
                                        .sort()
                                        .map(elementalType => (
                                            <MenuItem
                                                key={elementalType}
                                                value={ElementalType[elementalType as keyof typeof ElementalType]}>
                                                <ListItemIcon>
                                                    <img
                                                        src={`/assets/icons/elements/${elementalType}.png`} />
                                                </ListItemIcon>

                                                <ListItemText>
                                                    {t(`terms.elemental-types.${elementalType}`)}
                                                </ListItemText>
                                            </MenuItem>
                                        ))}
                                </Select>
                            </FormControl>
                        ) : null}
                    </>
                )}
                handleClose={() => setItemDialogOpen(false)}
                itemType={pickerSelection.itemType}
                onItemSelected={onItemPickerItemSelected}
                open={itemDialogOpen}
                preDefinedFilters={pickerSelection.filters} />

            <CellSelectDialog
                cellIndex={pickerSelection.cell?.index ?? null}
                cellType={pickerSelection.cell?.type ?? null}
                handleClose={() => setCellDialogOpen(false)}
                itemType={pickerSelection.itemType}
                onCellSelected={onCellPickerItemSelected}
                open={cellDialogOpen} />
        </>
    );
};

export default Build;
