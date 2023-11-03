export enum Tags {
    Event = "Event",
    Recommended = "Recommended",
}

export interface ItemWithTags {
    tags?: Tags[];
}
