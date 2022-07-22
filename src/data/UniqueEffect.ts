export interface UniqueEffect {
    name: string;
    icon?: string;
    title?: string;
    description: string;
    powerSurged?: boolean;
    values: {
        [key: string]: string;
    };
}
