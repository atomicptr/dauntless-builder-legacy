import {Language} from "../i18n";

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
