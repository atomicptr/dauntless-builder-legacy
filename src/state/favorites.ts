import { stateIdent } from "@src/state/common";
import { atom } from "jotai";
import { atomWithStorage } from "jotai/utils";

export interface Favorite {
    name: string;
    buildId: string;
}

export interface FavoritesState {
    favorites: Favorite[];
}

export const favoritesAtom = atomWithStorage<FavoritesState>(stateIdent("favorites"), {
    favorites: [],
});

export const favoritesView = atom(get => get(favoritesAtom).favorites);

export const addFavorite =
    (favorite: Favorite) =>
        (state: FavoritesState): FavoritesState => ({
            ...state,
            favorites: [...state.favorites, favorite],
        });

export const moveDownByBuildId =
    (buildId: string) =>
        (state: FavoritesState): FavoritesState => {
            const favorites = [...state.favorites];
            const index = favorites.findIndex(fav => fav.buildId === buildId);
            if (index === favorites.length - 1) {
                return state;
            }
            arrayMove(favorites, index, index + 1);
            return { ...state, favorites };
        };

export const moveUpByBuildId =
    (buildId: string) =>
        (state: FavoritesState): FavoritesState => {
            const favorites = [...state.favorites];
            const index = favorites.findIndex(fav => fav.buildId === buildId);
            if (index === 0) {
                return state;
            }
            arrayMove(favorites, index, index - 1);
            return { ...state, favorites };
        };

export const removeFavoriteByBuildId =
    (buildId: string) =>
        (state: FavoritesState): FavoritesState => {
            const favorites = [...state.favorites];
            const index = favorites.findIndex(fav => fav.buildId === buildId);
            if (index === -1) {
                return state;
            }
            favorites.splice(index, 1);
            return { ...state, favorites };
        };

export const updateFavorite =
    (favorite: Favorite) =>
        (state: FavoritesState): FavoritesState => {
            const favorites = [...state.favorites];
            const index = favorites.findIndex(fav => fav.buildId === favorite.buildId);
            favorites[index] = favorite;
            return { ...state, favorites };
        };

const arrayMove = <T>(array: T[], fromIndex: number, toIndex: number) => {
    const elem = array[fromIndex];
    array.splice(fromIndex, 1);
    array.splice(toIndex, 0, elem);
};

export const isBuildInFavorites = (favorites: Favorite[], buildId: string): boolean =>
    favorites.findIndex(favorite => favorite.buildId === buildId) > -1;
