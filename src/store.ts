import { configureStore } from "@reduxjs/toolkit";

import buildFinderSelectionReducer from "./reducers/build-finder/build-finder-selection-slice";
import metaBuildsSelectionReducer from "./reducers/meta-builds-selection/meta-builds-selection-slice";

const stateIdentifier = "state";
const reducersNotToBePersisted = ["itemSelectFilter"];

const persistedState =
    stateIdentifier in localStorage ? JSON.parse(localStorage.getItem(stateIdentifier) as string) : {};

export const store = configureStore({
    preloadedState: { ...persistedState },
    reducer: {
        buildFinderSelection: buildFinderSelectionReducer,
        metaBuildsSelection: metaBuildsSelectionReducer,
    },
});

// persist redux state in localStorage
store.subscribe(() => {
    persistState(exportState());
});

export const exportState = () =>
    Object.fromEntries(
        Object.entries(store.getState()).filter(([key]) => reducersNotToBePersisted.indexOf(key) === -1),
    );

export const persistState = (state: object) => localStorage.setItem(stateIdentifier, JSON.stringify(state));

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
