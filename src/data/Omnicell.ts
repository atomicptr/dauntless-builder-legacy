export interface Omnicell {
    name: string;
    icon: string;
    ability_icon: string;
    passive: string;
    active: string;
    passive_values: {
        [key: string]: number;
    };
    active_values: {
        [key: string]: number;
    };
}
