import {Language} from "@src/i18n";

export interface Omnicell {
    name: string;
    icon: string;
    ability_icon: string;
    passive: string;
    active: string;

    i18n?: {
        [language in Language]: {
            name?: string;
            passive?: string;
            active?: string;
        }
    }
}
