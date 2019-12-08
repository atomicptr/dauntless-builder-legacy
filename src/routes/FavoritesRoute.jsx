import React from "react";

import {Link} from "react-router-dom";

import FavoriteBuildsModel from "../models/FavoriteBuildsModel";
import BuildModel from "../models/BuildModel";
import { FormattedMessage } from "react-intl";
import ItemUtility from "../utility/ItemUtility";

export default class FavoritesRoute extends React.Component {

    deleteFavorite(buildId) {
        FavoriteBuildsModel.delete(buildId);
        this.setState({});
    }

    renderBuildTags(buildData) {
        const model = BuildModel.tryDeserialize(buildData);

        let tags = [];

        const weapon = model.weapon;

        if(weapon) {
            tags.push(<span key={weapon.name} className="tag is-warning"><FormattedMessage id={ItemUtility.itemTr(weapon, "name")} /></span>);
        }

        const armour = model.armour;

        if(armour.head) {
            const piece = armour.head;
            tags.push(<span key={piece.name} className="tag is-info"><FormattedMessage id={ItemUtility.itemTr(piece, "name")} /></span>);
        }

        if(armour.torso) {
            const piece = armour.torso;
            tags.push(<span key={piece.name} className="tag is-info"><FormattedMessage id={ItemUtility.itemTr(piece, "name")} /></span>);
        }

        if(armour.arms) {
            const piece = armour.arms;
            tags.push(<span key={piece.name} className="tag is-info"><FormattedMessage id={ItemUtility.itemTr(piece, "name")} /></span>);
        }

        if(armour.legs) {
            const piece = armour.legs;
            tags.push(<span key={piece.name} className="tag is-info"><FormattedMessage id={ItemUtility.itemTr(piece, "name")} /></span>);
        }

        const lantern = model.lantern;

        if(lantern) {
            tags.push(<span key={lantern.name} className="tag is-link"><FormattedMessage id={ItemUtility.itemTr(lantern, "name")} /></span>);
        }

        const perks = Object.keys(model.perks).map(perk =>
            ({name: perk, value: model.perks[perk]})).sort((a, b) => b.value - a.value);

        for(let p of perks) {
            const perk = p.name;
            const value = p.value;

            if(value >= 6) {
                tags.push(<span key={perk} className="tag is-success">+{value} <FormattedMessage id={ItemUtility.getTr("perks", perk, "name")} /></span>);
            } else if(value >= 4) {
                tags.push(<span key={perk} className="tag is-dark">+{value} <FormattedMessage id={ItemUtility.getTr("perks", perk, "name")} /></span>);
            }
        }

        return tags;
    }

    renderFavoriteBuildListItem(buildData, buildName) {
        return <div key={buildData} className="build-item">
            <Link to={"/b/" + buildData}>
                <div className="build-content">
                    <h3 className="build-title">{buildName}</h3>
                    <div className="build-tags">
                        {this.renderBuildTags(buildData)}
                    </div>
                </div>
            </Link>
            <div className="build-actions">
                <div className="delete-action" onClick={() => this.deleteFavorite(buildData)}>
                    <i className="fas fa-times"></i>
                </div>
            </div>
        </div>;
    }

    render() {
        let favorites = FavoriteBuildsModel.getBuilds();

        let favs = favorites.map(favorite =>
            this.renderFavoriteBuildListItem(favorite, FavoriteBuildsModel.getText(favorite)));

        let makeNewBuildsButton = <Link to="/b/new">
            <button className="button is-dark"><FormattedMessage id="ui.makeANewBuild" /></button>
        </Link>;

        if(favs.length === 0) {
            return <div>
                <h1 className="title"><FormattedMessage id="ui.myBuilds" /></h1>
                <h2 className="subtitle"><FormattedMessage id="ui.noSavedBuildYet" /></h2>
                {makeNewBuildsButton}
            </div>;
        }

        return <div>
            <h2 className="title"><FormattedMessage id="ui.myBuilds" /></h2>

            <div className="my-builds-list">
                {favs}
            </div>

            {makeNewBuildsButton}
        </div>;
    }
}