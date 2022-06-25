import { configureStore } from "@reduxjs/toolkit";

import buildReducer from "./features/build/build-slice";
import configurationReducer from "./features/configuration/configuration-slice";
import favoritesReducer from "./features/favorites/favorites-slice";
import itemSelectFilterReducer from "./features/item-select-filter/item-select-filter-slice";

const stateIdentifier = "state";
const reducersNotToBePersisted = ["itemSelectFilter"];

const persistedState =
    stateIdentifier in localStorage ? JSON.parse(localStorage.getItem(stateIdentifier) as string) : {};

export const store = configureStore({
    preloadedState: { ...persistedState },
    reducer: {
        build: buildReducer,
        configuration: configurationReducer,
        favorites: favoritesReducer,
        itemSelectFilter: itemSelectFilterReducer,
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
