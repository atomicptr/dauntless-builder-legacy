import log from "@src/utils/logger";
import md5 from "md5";

const createCacheIdentifier = (name: string, dependencies: unknown[]): string =>
    `cache::${name}::${md5(dependencies.map(d => JSON.stringify(d)).join("::"))}`;

const useCache = <T>(name: string, factory: () => T, dependencies: unknown[] = []): T => {
    const cacheIdentifier = createCacheIdentifier(name, dependencies);

    const item = localStorage.getItem(cacheIdentifier);

    if (item !== null) {
        try {
            return JSON.parse(item);
        } catch (e) {
            log.error(`Could not parse item in cache: ${cacheIdentifier}`, { e });
            localStorage.removeItem(cacheIdentifier);
        }
    }

    // if there is an outdated item with the same name, remove that
    Object.keys(localStorage).forEach(key => {
        if (key.startsWith(`cache::${name}::`)) {
            localStorage.removeItem(key);
        }
    });

    const data = factory();

    localStorage.setItem(cacheIdentifier, JSON.stringify(data));

    return data;
};

export default useCache;
