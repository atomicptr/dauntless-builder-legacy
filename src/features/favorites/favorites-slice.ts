import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "@src/store";

interface Favorite {
    name: string;
    buildId: string;
}

interface FavoritesState {
    favorites: Favorite[];
}

const initialState: FavoritesState = {
    favorites: [],
};

export const favoritesSlice = createSlice({
    initialState,
    name: "favorites",
    reducers: {
        addFavorite: (state, action: PayloadAction<Favorite>) => {
            state.favorites.push(action.payload);
        },
        moveDownByBuildId: (state, action: PayloadAction<string>) => {
            const index = state.favorites.findIndex(fav => fav.buildId === action.payload);
            if (index === state.favorites.length - 1) {
                return;
            }
            arrayMove(state.favorites, index, index + 1);
        },
        moveUpByBuildId: (state, action: PayloadAction<string>) => {
            const index = state.favorites.findIndex(fav => fav.buildId === action.payload);
            if (index === 0) {
                return;
            }
            arrayMove(state.favorites, index, index - 1);
        },
        removeFavoriteByBuildId: (state, action: PayloadAction<string>) => {
            const index = state.favorites.findIndex(fav => fav.buildId === action.payload);
            if (index === -1) {
                return;
            }
            state.favorites.splice(index, 1);
        },
    },
});

const arrayMove = <T>(array: T[], fromIndex: number, toIndex: number) => {
    const elem = array[fromIndex];
    array.splice(fromIndex, 1);
    array.splice(toIndex, 0, elem);
};

export const { addFavorite, removeFavoriteByBuildId, moveUpByBuildId, moveDownByBuildId } = favoritesSlice.actions;

export const selectConfiguration = (state: RootState) => ({
    ...state.configuration,
    devMode: DB_DEVMODE || state.configuration.devMode,
});

export const selectFavorites = (state: RootState) => state.favorites.favorites;

export const isBuildInFavorites = (favorites: Favorite[], buildId: string): boolean =>
    favorites.findIndex(favorite => favorite.buildId === buildId) > -1;

export default favoritesSlice.reducer;
