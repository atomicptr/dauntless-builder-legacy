export const deepCopy = <T>(obj: T): T => {
    if (typeof structuredClone !== "undefined") {
        return structuredClone(obj);
    }
    return JSON.parse(JSON.stringify(obj));
}