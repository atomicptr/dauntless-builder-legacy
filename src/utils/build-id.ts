import Hashids from "hashids";
import Sqids from "sqids";

export const buildIdRegex = /\/b\/[A-Za-z0-9_.\-~]{50,}/;

const alphabet = "MNWboUQG19y_Oja2ZEh4liLfst053FTCkpBVrw~Ix.7dJDnmugeKYS6-vcR8zqHAPX";

const sqids = new Sqids({ alphabet });

const hashids = new Hashids("spicy");

export enum BuildIdsProvider {
    HASHIDS,
    SQIDS,
}

export const buildIdsEncode = (numbers: number[], provider: BuildIdsProvider = BuildIdsProvider.SQIDS): string => {
    if (provider === BuildIdsProvider.HASHIDS) {
        return hashids.encode(numbers);
    }
    return sqids.encode(numbers);
};

export const buildIdsDecode = (id: string, provider: BuildIdsProvider = BuildIdsProvider.SQIDS): number[] => {
    if (provider === BuildIdsProvider.HASHIDS) {
        return hashids.decode(id) as number[];
    }
    return sqids.decode(id);
};

export const buildIdsProgressiveDecode = (id: string): number[] => {
    try {
        const data = hashids.decode(id);
        if (data.length > 8) {
            return data as number[];
        }
        /* eslint-disable-next-line no-empty */
    } catch {}

    return sqids.decode(id);
};
