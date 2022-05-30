import {Language} from "../i18n";
import {match} from "ts-pattern";

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

    i18n?: {
        [language in Language]: {
            name?: string;
            part_effect?: string[];
        }
    }
}

export const partBuildIdentifier = (partType: PartType): string =>
    match(partType)
        .with(PartType.Mod, () => "mods")
        .with(PartType.Special, () => "specials")
        .with(PartType.Chamber, () => "chambers")
        .with(PartType.Grip, () => "grips")
        .run();
