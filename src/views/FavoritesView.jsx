import React from "react";

import {Link} from "react-router-dom";

import FavoriteBuildsModel from "../models/FavoriteBuildsModel";
import BuildModel from "../models/BuildModel";

export default class FavoritesView extends React.Component {

    deleteFavorite(buildId) {
        FavoriteBuildsModel.delete(buildId);
        this.setState({});
    }

    renderBuildTags(buildData) {
        const model = BuildModel.tryDeserialize(buildData);

        let tags = [];

        const weapon = model.weapon;

        if(weapon) {
            tags.push(<span key={weapon.name} className="tag is-warning">{weapon.name}</span>);
        }

        const armour = model.armour;

        if(armour.head) {
            const piece = armour.head;
            tags.push(<span key={piece.name} className="tag is-info">{piece.name}</span>);
        }

        if(armour.torso) {
            const piece = armour.torso;
            tags.push(<span key={piece.name} className="tag is-info">{piece.name}</span>);
        }

        if(armour.arms) {
            const piece = armour.arms;
            tags.push(<span key={piece.name} className="tag is-info">{piece.name}</span>);
        }

        if(armour.legs) {
            const piece = armour.legs;
            tags.push(<span key={piece.name} className="tag is-info">{piece.name}</span>);
        }

        const lantern = model.lantern;

        if(lantern) {
            tags.push(<span key={lantern.name} className="tag is-link">{lantern.name}</span>);
        }

        const perks = Object.keys(model.perks).map(perk =>
            ({name: perk, value: model.perks[perk]})).sort((a, b) => b.value - a.value);

        for(let p of perks) {
            const perk = p.name;
            const value = p.value;

            if(value >= 6) {
                tags.push(<span key={perk} className="tag is-success">+{value} {perk}</span>);
            } else if(value >= 4) {
                tags.push(<span key={perk} className="tag is-dark">+{value} {perk}</span>);
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
            <button className="button is-dark">Make a new build</button>
        </Link>;

        if(favs.length === 0) {
            return <div>
                <h1 className="title">My builds</h1>
                <h2 className="subtitle">You haven't saved any builds yet.</h2>
                {makeNewBuildsButton}
            </div>;
        }

        return <div>
            <h2 className="title">My builds</h2>

            <div className="my-builds-list">
                {favs}
            </div>

            {makeNewBuildsButton}
        </div>;
    }
}