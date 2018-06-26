import { Object } from "core-js";

export default class FavoriteBuildsModel {

    static getData() {
        return JSON.parse(localStorage.getItem("__db_favorites") || "{}");
    }

    static getBuilds() {
        return Object.keys(FavoriteBuildsModel.getData());
    }

    static add(buildId, text) {
        let data = FavoriteBuildsModel.getData();
        data[buildId] = text;
        localStorage.setItem("__db_favorites", JSON.stringify(data));
    }

    static getText(buildId) {
        let data = FavoriteBuildsModel.getData();

        if(buildId in data) {
            return data[buildId];
        }

        return null;
    }

    static delete(buildId) {
        let data = FavoriteBuildsModel.getData();
        delete data[buildId];
        localStorage.setItem("__db_favorites", JSON.stringify(data));
    }

    static isFavorite(buildId) {
        return buildId in FavoriteBuildsModel.getData();
    }
}