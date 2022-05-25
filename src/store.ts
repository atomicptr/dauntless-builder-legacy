import { configureStore } from "@reduxjs/toolkit";
import buildReducer from "./features/build/build-slice";
import recentBuildsReducer from "./features/recent-builds/recent-builds-slice";

export const store = configureStore({
    reducer: {
        build: buildReducer,
        recentBuilds: recentBuildsReducer,
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
