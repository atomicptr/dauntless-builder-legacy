import { configureStore } from "@reduxjs/toolkit";

import buildReducer from "./features/build/build-slice";
import itemSelectFilterReducer from "./features/item-select-filter/item-select-filter-slice";

export const store = configureStore({
    reducer: {
        build: buildReducer,
        itemSelectFilter: itemSelectFilterReducer,
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
