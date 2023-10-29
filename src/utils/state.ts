import { stateIdent } from "@src/state/common";

export const exportState = () => {
    const state: { [key: string]: unknown } = {};

    for (const [key, value] of Object.entries(localStorage)) {
        if (key.indexOf(stateIdent("")) !== 0) {
            continue;
        }

        state[key] = JSON.parse(value);
    }

    return state;
};

export const persistState = (state: object) => {
    for (const [key, value] of Object.entries(state)) {
        const isOldStateObject = ["favorites", "configuration"].indexOf(key) > -1;
        const isStateObject = key.indexOf(stateIdent("")) === 0 || isOldStateObject;

        if (!isStateObject) {
            continue;
        }

        if (isOldStateObject) {
            localStorage.setItem(stateIdent(key), JSON.stringify(value));
            continue;
        }

        localStorage.setItem(key, JSON.stringify(value));
    }
};
