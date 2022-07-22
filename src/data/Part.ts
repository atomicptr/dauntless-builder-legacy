import dauntlessBuilderData, { RegularWeaponParts, RepeaterParts } from "@src/data/Data";
import { WeaponType } from "@src/data/Weapon";
import { Language } from "@src/i18n";
import { match } from "ts-pattern";

export enum PartType {
    Mod,
    Special,
    Chamber,
    Grip,
}

export interface Part {
    name: string;
    icon: string;
    part_effect: string[];
    values: {
        [key: string]: string;
    };

    i18n?: {
        [language in Language]: {
            name?: string;
            part_effect?: string[];
        };
    };
}

export type PartName = keyof RegularWeaponParts | keyof RepeaterParts;

export const partBuildIdentifier = (partType: PartType): PartName =>
    match<PartType, PartName>(partType)
        .with(PartType.Mod, () => "mods")
        .with(PartType.Special, () => "specials")
        .with(PartType.Chamber, () => "chambers")
        .with(PartType.Grip, () => "grips")
        .run();

export const partTypeData = (weaponType: WeaponType, partType: PartType) =>
    match(weaponType)
        .with(
            WeaponType.AetherStrikers,
            () => dauntlessBuilderData.parts.aetherstrikers[partBuildIdentifier(partType) as keyof RegularWeaponParts],
        )
        .with(
            WeaponType.Axe,
            () => dauntlessBuilderData.parts.axe[partBuildIdentifier(partType) as keyof RegularWeaponParts],
        )
        .with(
            WeaponType.Hammer,
            () => dauntlessBuilderData.parts.hammer[partBuildIdentifier(partType) as keyof RegularWeaponParts],
        )
        .with(
            WeaponType.ChainBlades,
            () => dauntlessBuilderData.parts.chainblades[partBuildIdentifier(partType) as keyof RegularWeaponParts],
        )
        .with(
            WeaponType.Sword,
            () => dauntlessBuilderData.parts.sword[partBuildIdentifier(partType) as keyof RegularWeaponParts],
        )
        .with(
            WeaponType.Repeater,
            () => dauntlessBuilderData.parts.repeater[partBuildIdentifier(partType) as keyof RepeaterParts],
        )
        .with(
            WeaponType.WarPike,
            () => dauntlessBuilderData.parts.warpike[partBuildIdentifier(partType) as keyof RegularWeaponParts],
        )
        .exhaustive();
