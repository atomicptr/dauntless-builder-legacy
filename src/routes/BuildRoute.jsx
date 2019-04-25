import React from "react";
import PropTypes from "prop-types";

import {Link} from "react-router-dom";

import {CopyToClipboard} from "react-copy-to-clipboard";

import ReactTooltip from "react-tooltip";

import Helmet from "react-helmet";

import BuildModel from "../models/BuildModel";
import DataUtility from "../utility/DataUtility";

import Item from "../components/Item";
import ItemSelectModal from "../components/ItemSelectModal";
import Debug from "../components/Debug";
import DebugButton from "../components/DebugButton";
import PerkList from "../components/PerkList";
import FavoriteBuildsModel from "../models/FavoriteBuildsModel";
import ItemUtility from "../utility/ItemUtility";
import MenuDropdown from "../components/MenuDropdown";

import Repeater from "../components/Repeater";
import RepeaterPartSelectModal from "../components/RepeaterPartSelectModal";
import DarkModeToggle from "../components/DarkModeToggle";
import WeaponPartSelectModal from "../components/WeaponPartSelectModal";
import WeaponPart from "../components/WeaponPart";

export default class BuildRoute extends React.Component {

    constructor(props, context) {
        super(props, context);

        this.state = {
            ready: false,
            itemSelectModalOpen: false,
            repeaterPartSelectModalOpen: false,
            weaponPartSelectModalOpen: false,
            modalData: {}
        };
    }

    componentDidMount() {
        const buildData = this.props.match.params.buildData;

        // redirect all v1 builds to seperate v1 website
        if (BuildModel.version(buildData) === 1) {
            window.location.href = "https://v1.dauntless-builder.com/b/" + buildData;
        }

        this.loadBuild(buildData);
    }

    loadBuild(buildData) {
        const itemData = DataUtility.data();
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
            changes.weapon_level = ItemUtility.maxLevel("weapons", itemName);
            changes.weapon_cell0 = "";
            changes.weapon_cell1 = "";
            changes.weapon_part1_name = "";
            changes.weapon_part1_level = 0;
            changes.weapon_part2_name = "";
            changes.weapon_part2_level = 0;
            changes.weapon_part3_name = "";
            changes.weapon_part3_level = 0;
            changes.weapon_part4_name = "";
            changes.weapon_part4_level = 0;
            changes.weapon_part5_name = "";
            changes.weapon_part5_level = 0;
            changes.weapon_part6_name = "";
            changes.weapon_part6_level = 0;
        } else if(itemType === "Armour") {
            let type = data.__armourType.toLowerCase();

            changes[`${type}_name`] = itemName;
            changes[`${type}_level`] = ItemUtility.maxLevel("armours", itemName);
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

    onPartSelected(fieldPrefix, part) {
        let changes = {};

        changes[fieldPrefix + "_name"] = part.name;

        if (part.power) {
            const maxLevel = Math.max(...Object.keys(part.power).map(k => Number(k)));
            changes[fieldPrefix + "_level"] = maxLevel;
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

    openRepeaterPartSelectModal(partType, fieldName) {
        this.onModalOpen();
        this.setState({repeaterPartSelectModalOpen: true, modalData: {partType, fieldName}});
    }

    onRepeaterPartSelectModalClosed() {
        this.onModalClosed();
        this.setState({repeaterPartSelectModalOpen: false, modalData: {}});
    }

    onRepeaterPartSelected(fieldPrefix, part) {
        this.onPartSelected(fieldPrefix, part);
        this.onRepeaterPartSelectModalClosed();
    }

    openWeaponPartSelectModal(weaponType, partType, fieldName) {
        this.onModalOpen();
        this.setState({weaponPartSelectModalOpen: true, modalData: {weaponType, partType, fieldName}});
    }

    onWeaponPartSelectModalClosed() {
        this.onModalClosed();
        this.setState({weaponPartSelectModalOpen: false, modalData: {}});
    }

    onWeaponPartSelected(fieldPrefix, part) {
        this.onPartSelected(fieldPrefix, part);
        this.onWeaponPartSelectModalClosed();
    }

    renderWeapon() {
        const weapon = BuildModel.findWeapon(this.state.build.weapon_name);

        if(weapon && ItemUtility.isRepeater(weapon)) {
            return <Repeater
                parent={this}
                onItemClicked={this.onItemClicked.bind(this)}
                onCellClicked={this.onCellClicked.bind(this)}
                item={weapon}
                cells={[
                    [this.state.build.weapon_cell0, BuildModel.findCellByVariantName(this.state.build.weapon_cell0)],
                    [this.state.build.weapon_cell1, BuildModel.findCellByVariantName(this.state.build.weapon_cell1)],
                ]} />;
        }

        return <Item
            parent={this}
            onItemClicked={this.onItemClicked.bind(this)}
            onCellClicked={this.onCellClicked.bind(this)}
            title="Weapon" defaultType="Weapon"
            item={weapon}
            level={this.state.build.weapon_level}
            cells={[
                [this.state.build.weapon_cell0, BuildModel.findCellByVariantName(this.state.build.weapon_cell0)],
                [this.state.build.weapon_cell1, BuildModel.findCellByVariantName(this.state.build.weapon_cell1)],
            ]} />;
    }

    renderWeaponParts() {
        const weapon = BuildModel.findWeapon(this.state.build.weapon_name);

        if (!weapon) {
            return;
        }

        const weaponHasParts = partName =>
            weapon.type.toLowerCase() in this.state.itemData.parts &&
            partName in this.state.itemData.parts[weapon.type.toLowerCase()];

        let parts = [];

        if (weaponHasParts("specials")) {
            let slot = "weapon_part1_name";

            if (ItemUtility.isRepeater(weapon)) {
                slot = "weapon_part5_name";
            }

            const part = BuildModel.findPart(weapon.type, "specials", this.state.build[slot]);

            parts.push(
                <WeaponPart key={weapon.type + "_special"} part={part} partType="specials" onClicked={
                    () => this.openWeaponPartSelectModal(weapon.type, "specials", slot)
                } />
            );
        }

        if (weaponHasParts("mods")) {
            let slot = "weapon_part2_name";

            if (ItemUtility.isRepeater(weapon)) {
                slot = "weapon_part6_name";
            }

            const part = BuildModel.findPart(weapon.type, "mods", this.state.build[slot]);

            parts.push(
                <WeaponPart key={weapon.type + "_mod"} part={part} partType="mods" onClicked={
                    () => this.openWeaponPartSelectModal(weapon.type, "mods", slot)
                } />
            );
        }

        return parts;
    }


    getMetaTitle() {
        if(this.state.build.weapon_name) {
            return this.state.build.weapon_name + " Build - Dauntless Builder";
        }

        return "Dauntless Builder";
    }

    getMetaDescription() {
        const model = BuildModel.tryDeserialize(this.state.buildData);

        let armourPieces = Object.values(model.armour)
            .filter(piece => piece !== null)
            .map(piece => piece.name);

        if(model.lantern) {
            armourPieces.push(model.lantern.name);
        }

        let metaPerks = [];

        const perks = Object.keys(model.perks).map(perk =>
            ({name: perk, value: model.perks[perk]})).sort((a, b) => b.value - a.value);

        for(let p of perks) {
            const perk = p.name;
            const value = p.value;

            // only show perks with at least +4
            if(value >= 4) {
                metaPerks.push(`+${value} ${perk}`);
            }
        }

        let result = `⚔️ ${armourPieces.join(", ")} | ${metaPerks.join(", ")}`;

        if(result.length > 140) {
            result = result.substring(0, 137) + "...";
        }

        return result;
    }

    getMetaImage() {
        if(this.state.build.weapon_name) {
            const weapon = BuildModel.findWeapon(this.state.build.weapon_name);

            if(weapon.icon) {
                return `https://www.dauntless-builder.com${weapon.icon}`;
            }
        }

        return "https://www.dauntless-builder.com/assets/icon.png";
    }

    render() {
        if(!this.state.ready) {
            return <div>...</div>;
        }

        return <React.Fragment>
            <Helmet>
                <title>{this.getMetaTitle()}</title>
                <meta name="description" content={this.getMetaDescription()} />

                <meta property="og:site_name" content="Dauntless Builder" />
                <meta property="og:title" content={this.getMetaTitle()} />
                <meta property="og:description" content={this.getMetaDescription()} />
                <meta property="og:image" content={this.getMetaImage()} />
            </Helmet>

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
                    <MenuDropdown label={
                        <React.Fragment>
                            <i className="fas fa-ellipsis-v" style={{margin: "0px 5px"}}></i>
                            <span className="only-on-very-small">&nbsp;More</span>
                        </React.Fragment>
                    }>
                        <DarkModeToggle />
                        <hr className="dropdown-divider" />
                        <a className="dropdown-item disabled">
                            <i className="fas fa-cog"></i> Settings
                        </a>
                    </MenuDropdown>
                </div>
            </div>
            <div className="columns">
                <div className="column is-two-thirds">
                    {this.renderWeapon()}
                    {this.renderWeaponParts()}

                    <Item
                        parent={this}
                        onItemClicked={this.onItemClicked.bind(this)}
                        onCellClicked={this.onCellClicked.bind(this)}
                        title="Head Armour" defaultType="Head"
                        item={BuildModel.findArmour(this.state.build.head_name)}
                        level={this.state.build.head_level}
                        cells={[
                            [this.state.build.head_cell, BuildModel.findCellByVariantName(this.state.build.head_cell)]
                        ]} />

                    <Item
                        parent={this}
                        onItemClicked={this.onItemClicked.bind(this)}
                        onCellClicked={this.onCellClicked.bind(this)}
                        title="Torso Armour" defaultType="Torso"
                        item={BuildModel.findArmour(this.state.build.torso_name)}
                        level={this.state.build.torso_level}
                        cells={[
                            [this.state.build.torso_cell, BuildModel.findCellByVariantName(this.state.build.torso_cell)]
                        ]} />

                    <Item
                        parent={this}
                        onItemClicked={this.onItemClicked.bind(this)}
                        onCellClicked={this.onCellClicked.bind(this)}
                        title="Arms Armour" defaultType="Arms"
                        item={BuildModel.findArmour(this.state.build.arms_name)}
                        level={this.state.build.arms_level}
                        cells={[
                            [this.state.build.arms_cell, BuildModel.findCellByVariantName(this.state.build.arms_cell)]
                        ]} />

                    <Item
                        parent={this}
                        onItemClicked={this.onItemClicked.bind(this)}
                        onCellClicked={this.onCellClicked.bind(this)}
                        title="Legs Armour" defaultType="Legs"
                        item={BuildModel.findArmour(this.state.build.legs_name)}
                        level={this.state.build.legs_level}
                        cells={[
                            [this.state.build.legs_cell, BuildModel.findCellByVariantName(this.state.build.legs_cell)]
                        ]} />

                    <Item
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
                    <PerkList perks={this.getOrderedPerks()} />
                    <br />
                    <DebugButton onClick={() => this.dummyData()}>
                        <i className="fas fa-database"></i>&nbsp;Add Dummy Data
                    </DebugButton>
                    <Debug data={this.state.build} active={true} />
                </div>
            </div>
            <ItemSelectModal
                data={this.state.modalData}
                itemData={this.state.itemData}
                onSelected={this.onNewItemSelected.bind(this)}
                onCanceled={this.onModalCanceled.bind(this)}
                isOpen={this.state.itemSelectModalOpen} />
            <RepeaterPartSelectModal
                data={this.state.modalData}
                itemData={this.state.itemData}
                onClosed={this.onRepeaterPartSelectModalClosed.bind(this)}
                onSelected={this.onRepeaterPartSelected.bind(this)}
                isOpen={this.state.repeaterPartSelectModalOpen} />
            <WeaponPartSelectModal
                data={this.state.modalData}
                itemData={this.state.itemData}
                onClosed={this.onWeaponPartSelectModalClosed.bind(this)}
                onSelected={this.onWeaponPartSelected.bind(this)}
                isOpen={this.state.weaponPartSelectModalOpen} />
        </React.Fragment>;
    }
}

BuildRoute.propTypes = {
    match: PropTypes.shape({
        params: PropTypes.shape({
            buildData: PropTypes.string,
        }),
    }).isRequired
};
