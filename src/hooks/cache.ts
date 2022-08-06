import log from "@src/utils/logger";
import md5 from "md5";

const createCacheIdentifier = (name: string, dependencies: unknown[]): string =>
    `cache::${name}::${md5(
        dependencies
            .concat([DB_BUILD_TIME])
            .map(d => JSON.stringify(d))
            .join("::"),
    )}`;

const retrieveItem = (cacheIdentifier: string) => {
    const item = localStorage.getItem(cacheIdentifier);

    if (item !== null) {
        try {
            return JSON.parse(item);
        } catch (e) {
            log.error(`Could not parse item in cache: ${cacheIdentifier}`, { e });
            localStorage.removeItem(cacheIdentifier);
        }
    }

    return null;
};

const storeItem = (cacheIdentifier: string, data: unknown) => {
    localStorage.setItem(cacheIdentifier, JSON.stringify(data));
};

const purgeOutdatedKeys = (name: string) => {
    Object.keys(localStorage).forEach(key => {
        if (key.startsWith(`cache::${name}::`)) {
            localStorage.removeItem(key);
        }
    });
};

export const useCache = <T>(name: string, factory: () => T, dependencies: unknown[] = []): T => {
    const cacheIdentifier = createCacheIdentifier(name, dependencies);

    const item = retrieveItem(cacheIdentifier);
    if (item !== null) {
        return item;
    }

    purgeOutdatedKeys(name);

    const data = factory();

    storeItem(cacheIdentifier, data);

    return data;
};

export const useCacheAsync = async <T>(
    name: string,
    factory: () => Promise<T>,
    dependencies: unknown[] = [],
): Promise<T> => {
    const cacheIdentifier = createCacheIdentifier(name, dependencies);

    const item = retrieveItem(cacheIdentifier);
    if (item !== null) {
        return item;
    }

    purgeOutdatedKeys(name);

    const data = await factory();

    storeItem(cacheIdentifier, data);

    return data;
};

// This exists because react-hooks/rules-of-hooks doesn't allow us to re-use this somewhere else because it is kinda
// a hook but works perfectly fine even if you use it outside react components
export const cacheAsync = useCacheAsync;
