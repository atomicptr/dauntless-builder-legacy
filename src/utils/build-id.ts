import Hashids from "hashids";
import Sqids from "sqids";

export const buildIdRegex = /\/b\/[A-Za-z0-9_.\-~]{50,}/;

const alphabetV7 = "MNWboUQG19y_Oja2ZEh4liLfst053FTCkpBVrw~Ix.7dJDnmugeKYS6-vcR8zqHAPX";
const alphabetV8 = "h1tiFLYU5eO6rSEfg_JdlVHvMz0NToujK9-ncwXp7P24axkRWsAG3bBImyD8CZQq";

const hashids = new Hashids("spicy");

const sqidsV7 = new Sqids({ alphabet: alphabetV7 });
const sqidsV8 = new Sqids({ alphabet: alphabetV8 });

export enum BuildIdsProvider {
    HASHIDS,
    SQIDS_V7,
    SQIDS_V8,
}

export const buildIdsEncode = (numbers: number[], provider: BuildIdsProvider = BuildIdsProvider.SQIDS_V8): string => {
    if (provider === BuildIdsProvider.HASHIDS) {
        return hashids.encode(numbers);
    }

    if (provider === BuildIdsProvider.SQIDS_V7) {
        return sqidsV7.encode(numbers);
    }

    return sqidsV8.encode(numbers);
};

export const buildIdsDecode = (id: string, provider: BuildIdsProvider = BuildIdsProvider.SQIDS_V8): number[] => {
    if (provider === BuildIdsProvider.HASHIDS) {
        return hashids.decode(id) as number[];
    }
    if (provider === BuildIdsProvider.SQIDS_V7) {
        return sqidsV7.decode(id);
    }

    return sqidsV8.decode(id);
};

export const buildIdsProgressiveDecode = (id: string): number[] => {
    try {
        const data = hashids.decode(id);
        if (data.length > 8) {
            return data as number[];
        }
        /* eslint-disable-next-line no-empty */
    } catch {}

    try {
        const data = sqidsV7.decode(id);
        if (data.length > 8) {
            return data as number[];
        }
        /* eslint-disable-next-line no-empty */
    } catch {}

    return sqidsV8.decode(id);
};
