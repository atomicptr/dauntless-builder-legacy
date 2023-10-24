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
        localStorage.setItem(key, JSON.stringify(value));
    }
};
