import React from "react";
import PropTypes from "prop-types";

import {Link} from "react-router-dom";

import {CopyToClipboard} from "react-copy-to-clipboard";

import ReactTooltip from "react-tooltip";

import BuildModel from "../models/BuildModel";
import DataUtil from "../utils/DataUtil";

import ItemComponent from "../components/ItemComponent";
import ItemSelectModalComponent from "../components/ItemSelectModalComponent";
import DebugComponent from "../components/DebugComponent";
import DebugButtonComponent from "../components/DebugButtonComponent";
import PerkListComponent from "../components/PerkListComponent";
import FavoriteBuildsModel from "../models/FavoriteBuildsModel";
import MiscUtils from "../utils/MiscUtils";
import BuildEmbeddedModalComponent from "../components/BuildEmbeddedModalComponent";

export default class BuildView extends React.Component {

    constructor(props, context) {
        super(props, context);

        this.state = {
            ready: false,
            itemSelectModalOpen: false,
            buildEmbedModalOpen: false,
            modalData: {}
        };
    }

    componentDidMount() {
        const buildData = this.props.match.params.buildData;

        this.loadBuild(buildData);
    }

    loadBuild(buildData) {
        const itemData = DataUtil.data();
        const build = BuildModel.tryDeserialize(buildData);

        this.setState({
            itemData, build, buildData, ready: true
        });

        console.log("Build:", build.serialize());
    }

    updateUrl() {
        const buildData = this.state.build.serialize();

        window.history.replaceState({}, "Dauntless Builder: " + buildData, "/b/" + buildData);

        this.setState({
            buildData
        });
    }

    dummyData() {
        let build = this.state.build;

        // weapon
        build.weapon_name = "Ragesaber";
        build.weapon_level = 10;
        build.weapon_cell0 = "+3 Energized Cell";
        build.weapon_cell1 = "+1 Tough Cell";
        build.head_name = "Ragetail Touque";
        build.head_level = 10;
        build.head_cell = "+3 Tough Cell";
        build.torso_name = "Ragetail Cloak";
        build.torso_level = 10;
        build.torso_cell = "+2 Tough Cell";
        build.arms_name = "Ragetail Grips";
        build.arms_level = 10;
        build.arms_cell = "+2 Ragehunter Cell";
        build.legs_name = "Ragetail Treads";
        build.legs_level = 9;
        build.legs_cell = "+3 Ragehunter Cell";
        build.lantern_name = "Shrike's Zeal";
        build.lantern_cell = "+2 Energized Cell";

        this.setState({
            build
        }, () => this.updateUrl());
    }

    onCopyToClipboard() {
        console.log("Copied to clipboard:", window.location.origin + "/b/" + this.state.buildData);
    }

    onModalOpen() {
        document.querySelector("html").classList.add("disable-scrolling");
    }

    onItemClicked(filterOptions) {
        this.onModalOpen();
        this.setState({
            itemSelectModalOpen: true,
            modalData: {filterOptions}
        });
    }

    onCellClicked(filterOptions) {
        this.onItemClicked(filterOptions);
    }

    onNewItemSelected(itemType, itemName, data) {
        let changes = {};

        console.log("Selected: ", itemType, itemName, data);

        if(itemType === "Weapon") {
            changes.weapon_name = itemName;
            changes.weapon_level = MiscUtils.maxLevel("weapons", itemName);
            changes.weapon_cell0 = "";
            changes.weapon_cell1 = "";
        } else if(itemType === "Armour") {
            let type = data.__armourType.toLowerCase();

            changes[`${type}_name`] = itemName;
            changes[`${type}_level`] = MiscUtils.maxLevel("armours", itemName);
            changes[`${type}_cell`] = "";
        } else if(itemType === "Lantern") {
            changes.lantern_name = itemName;
            changes.lantern_cell = "";
        }else if(itemType === "Cell") {
            if(data.__parentType === "Weapon") {
                changes["weapon_cell" + data.__slotPosition] = itemName;
            } else {
                changes[data.__parentType.toLowerCase() + "_cell"] = itemName;
            }
        }

        this.applyItemSelection(changes);
    }

    onModalCanceled() {
        this.onModalClosed();

        this.setState({
            itemSelectModalOpen: false,
            modalData: {}
        });
    }

    onModalClosed() {
        document.querySelector("html").classList.remove("disable-scrolling");
    }

    getOrderedPerks() {
        let perks = Object.keys(this.state.build.perks).map(perkName =>
            ({name: perkName, value: this.state.build.perks[perkName]}));

        perks.sort((a, b) => b.value - a.value || a.name.localeCompare(b.name));

        return perks;
    }

    applyItemSelection(changes) {
        let build = this.state.build;

        for(let key in changes) {
            build[key] = changes[key];
        }

        this.setState({build, itemSelectModalOpen: false}, () => {
            this.updateUrl();
            this.onModalClosed();
        });
    }

    toggleFavorite() {
        const buildData = this.state.buildData;

        if(FavoriteBuildsModel.isFavorite(buildData)) {
            FavoriteBuildsModel.delete(buildData);
        } else {
            // TODO replace prompt with popper
            FavoriteBuildsModel.add(buildData, prompt("Build name"));
        }

        this.setState({});
    }

    openBuildEmbeddedModal() {
        this.onModalOpen();
        this.setState({buildEmbedModalOpen: true});
    }

    onBuildEmbeddedModalClosed() {
        this.onModalClosed();
        this.setState({buildEmbedModalOpen: false});
    }

    render() {
        if(!this.state.ready) {
            return <div>...</div>;
        }

        return <React.Fragment>
            <div className="quick-actions">
                <div className="qa-left">
                    <Link to="/b/new">
                        <button className="button is-light" onClick={() => this.loadBuild("new")}>
                            <i className="fas fa-plus"></i>&nbsp;New
                        </button>
                    </Link>
                    <Link to="/favorites">
                        <button className="button is-light">
                            <i className="fas fa-folder-open"></i>&nbsp;My builds
                        </button>
                    </Link>
                    <Link to="/dev">
                        <DebugButtonComponent>
                            <i className="fas fa-code"></i>&nbsp;Dev Menu
                        </DebugButtonComponent>
                    </Link>
                </div>
                <div className="qa-right">
                    <CopyToClipboard text={window.location.origin + "/b/" + this.state.buildData} refs="copyButton"  onCopy={() => this.onCopyToClipboard()}>
                        <button className="button is-light" data-tip="Copy to clipboard">
                            <i className="fas fa-copy"></i><span className="only-on-very-small">&nbsp;Copy to clipboard</span>
                            <ReactTooltip globalEventOff="click" place="top" type="dark" effect="solid" />
                        </button>
                    </CopyToClipboard>
                    <button className="button is-light"
                        data-tip={FavoriteBuildsModel.isFavorite(this.state.buildData) ? "Unfavorite build" : "Favorite build"}
                        onClick={() => this.toggleFavorite()}>

                        <i className={(FavoriteBuildsModel.isFavorite(this.state.buildData) ? "fas" : "far") + " fa-heart"}></i>
                        <span className="only-on-very-small">&nbsp;Save to favorites</span>
                    </button>
                    <button className="button is-light only-desktop"
                        data-tip="Embed build on other website"
                        onClick={() => this.openBuildEmbeddedModal()}>

                        <i className="fas fa-code"></i>
                    </button>
                    <button className="button is-light" data-tip="Settings" disabled>
                        <i className="fas fa-cog"></i><span className="only-on-very-small">&nbsp;Settings</span>
                    </button>
                </div>
            </div>
            <div className="columns">
                <div className="column is-two-thirds">

                    <ItemComponent
                        parent={this}
                        onItemClicked={this.onItemClicked.bind(this)}
                        onCellClicked={this.onCellClicked.bind(this)}
                        title="Weapon" defaultType="Weapon"
                        item={BuildModel.findWeapon(this.state.build.weapon_name)}
                        level={this.state.build.weapon_level}
                        cells={[
                            [this.state.build.weapon_cell0, BuildModel.findCellByVariantName(this.state.build.weapon_cell0)],
                            [this.state.build.weapon_cell1, BuildModel.findCellByVariantName(this.state.build.weapon_cell1)],
                        ]} />

                    <ItemComponent
                        parent={this}
                        onItemClicked={this.onItemClicked.bind(this)}
                        onCellClicked={this.onCellClicked.bind(this)}
                        title="Head Armour" defaultType="Head"
                        item={BuildModel.findArmour(this.state.build.head_name)}
                        level={this.state.build.head_level}
                        cells={[
                            [this.state.build.head_cell, BuildModel.findCellByVariantName(this.state.build.head_cell)]
                        ]} />

                    <ItemComponent
                        parent={this}
                        onItemClicked={this.onItemClicked.bind(this)}
                        onCellClicked={this.onCellClicked.bind(this)}
                        title="Torso Armour" defaultType="Torso"
                        item={BuildModel.findArmour(this.state.build.torso_name)}
                        level={this.state.build.torso_level}
                        cells={[
                            [this.state.build.torso_cell, BuildModel.findCellByVariantName(this.state.build.torso_cell)]
                        ]} />

                    <ItemComponent
                        parent={this}
                        onItemClicked={this.onItemClicked.bind(this)}
                        onCellClicked={this.onCellClicked.bind(this)}
                        title="Arms Armour" defaultType="Arms"
                        item={BuildModel.findArmour(this.state.build.arms_name)}
                        level={this.state.build.arms_level}
                        cells={[
                            [this.state.build.arms_cell, BuildModel.findCellByVariantName(this.state.build.arms_cell)]
                        ]} />

                    <ItemComponent
                        parent={this}
                        onItemClicked={this.onItemClicked.bind(this)}
                        onCellClicked={this.onCellClicked.bind(this)}
                        title="Legs Armour" defaultType="Legs"
                        item={BuildModel.findArmour(this.state.build.legs_name)}
                        level={this.state.build.legs_level}
                        cells={[
                            [this.state.build.legs_cell, BuildModel.findCellByVariantName(this.state.build.legs_cell)]
                        ]} />

                    <ItemComponent
                        parent={this}
                        onItemClicked={this.onItemClicked.bind(this)}
                        onCellClicked={this.onCellClicked.bind(this)}
                        title="Lantern" defaultType="Lantern"
                        item={BuildModel.findLantern(this.state.build.lantern_name)}
                        cells={[
                            [this.state.build.lantern_cell, BuildModel.findCellByVariantName(this.state.build.lantern_cell)]
                        ]} />
                </div>
                <div className="column is-one-third">
                    <PerkListComponent perks={this.getOrderedPerks()} />
                    <br />
                    <DebugButtonComponent onClick={() => this.dummyData()}>
                        <i className="fas fa-database"></i>&nbsp;Add Dummy Data
                    </DebugButtonComponent>
                    <DebugComponent data={this.state.build} active={true} />
                </div>
            </div>
            <ItemSelectModalComponent
                data={this.state.modalData}
                itemData={this.state.itemData}
                onSelected={this.onNewItemSelected.bind(this)}
                onCanceled={this.onModalCanceled.bind(this)}
                isOpen={this.state.itemSelectModalOpen} />
            <BuildEmbeddedModalComponent
                onClosed={this.onBuildEmbeddedModalClosed.bind(this)}
                buildId={this.state.buildData}
                isOpen={this.state.buildEmbedModalOpen} />
        </React.Fragment>;
    }
}

BuildView.propTypes = {
    match: PropTypes.shape({
        params: PropTypes.shape({
            buildData: PropTypes.string,
        }),
    }).isRequired
};