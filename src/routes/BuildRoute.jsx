import React from "react";
import PropTypes from "prop-types";

import {Link} from "react-router-dom";

import {CopyToClipboard} from "react-copy-to-clipboard";

import ReactTooltip from "react-tooltip";

import Helmet from "react-helmet";

import BuildModel, {CURRENT_BUILD_ID} from "../models/BuildModel";
import DataUtility from "../utility/DataUtility";

import Item from "../components/Item";
import ItemSelectModal from "../components/ItemSelectModal";
import Debug from "../components/Debug";
import DebugButton from "../components/DebugButton";
import PerkList from "../components/PerkList";
import FavoriteBuildsModel from "../models/FavoriteBuildsModel";
import ItemUtility from "../utility/ItemUtility";
import MenuDropdown from "../components/MenuDropdown";

import DarkModeToggle from "../components/DarkModeToggle";
import WeaponPartSelectModal from "../components/WeaponPartSelectModal";
import WeaponPart from "../components/WeaponPart";
import BondSelectModal from "../components/BondSelectModal";
import Omnicell from "../components/Omnicell";
import OmnicellSelectModal from "../components/OmnicellSelectModal";
import BuildWarning from "../components/BuildWarning";
import {validateBuild} from "../service/build-validator";

export default class BuildRoute extends React.Component {

    constructor(props, context) {
        super(props, context);

        this.state = {
            ready: false,
            itemSelectModalOpen: false,
            bondItemModalOpen: false,
            weaponPartSelectModalOpen: false,
            omnicellSelectModalOpen: false,
            modalData: {}
        };
    }

    componentDidMount() {
        let buildData = this.props.match.params.buildData;

        // redirect all v1 builds back to the start page
        if (BuildModel.version(buildData) === 1) {
            window.location.href = "https://www.dauntless-builder.com/";
        }

        if (BuildModel.version(buildData) === 2) {
            buildData = BuildModel.convertVersion2To3(buildData);
            window.history.replaceState({}, "Dauntless Builder: " + buildData, "/b/" + buildData);
        }

        if (BuildModel.version(buildData) === 3) {
            buildData = BuildModel.convertVersion3To4(buildData);
            window.history.replaceState({}, "Dauntless Builder: " + buildData, "/b/" + buildData);
        }

        if (BuildModel.version(buildData) === 4) {
            buildData = BuildModel.convertVersion4To5(buildData);
            window.history.replaceState({}, "Dauntless Builder: " + buildData, "/b/" + buildData);
        }

        if (BuildModel.version(buildData) === 5) {
            buildData = BuildModel.convertVersion5To6(buildData);
            window.history.replaceState({}, "Dauntless Builder: " + buildData, "/b/" + buildData);
        }

        this.loadBuild(buildData);
    }

    loadBuild(buildData) {
        const itemData = DataUtility.data();
        let build = BuildModel.tryDeserialize(buildData);
        build = validateBuild(build);

        // validator changed something
        const postValidatorBuildData = build.serialize();
        if (postValidatorBuildData !== buildData) {
            window.history.replaceState({}, "Dauntless Builder: " + postValidatorBuildData, "/b/" + postValidatorBuildData);
        }

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
        let build = BuildModel.empty();

        // weapon
        build.weapon_name = "Brutality of Boreus";
        build.weapon_level = 1;
        build.weapon_part1_name = "Mighty Landbreaker";
        build.weapon_part2_name = "Impulse Crown";
        build.weapon_cell0 = "+3 Deconstruction Cell";
        build.weapon_cell1 = "+3 Assassin's Vigour Cell";
        build.torso_name = "Boreal Resolve";
        build.torso_level = 1;
        build.torso_cell = "+3 Guardian Cell";
        build.arms_name = "Boreal Might";
        build.arms_level = 1;
        build.arms_cell = "+3 Aetherhunter Cell";
        build.legs_name = "Boreal March";
        build.legs_level = 1;
        build.legs_cell = "+3 Predator Cell";
        build.head_name = "Boreal Epiphany";
        build.head_level = 1;
        build.head_cell = "+3 Aetheric Attunement Cell";
        build.lantern_name = "Embermane's Rapture";
        build.lantern_cell = "+3 Aetheric Attunement Cell";
        build.omnicell = "Bastion";

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

    getCellsForKeys(keys) {
        return keys.reduce((cells, key) => {
            cells[key] = this.state.build[key] ? BuildModel.findCellByVariantName(this.state.build[key]) : {};

            return cells;
        }, {});
    }

    onNewItemSelected(itemType, itemName, level, data) {
        let changes = {};

        console.log("Selected: ", itemType, itemName, level, data);

        if(itemType === "Weapon") {
            const item = BuildModel.findWeapon(itemName);
            const itemType = item ? item.type : null;

            changes.weapon_name = itemName;
            changes.weapon_level = Math.min(level, ItemUtility.maxLevel("weapons", itemName));
            changes.weapon_cell0 = "";
            changes.weapon_cell1 = "";
            changes.bond_weapon_name = "";

            if (!this.state.build.weapon || itemType !== this.state.build.weapon.type) {
                changes.weapon_part1_name = "";
                changes.weapon_part2_name = "";
                changes.weapon_part3_name = "";
            } else if(this.state.build.weapon.restrict_specials) {
                changes.weapon_part1_name = "";
            }

            // exotic repeaters don't chamber and grip
            if (itemType === "Repeater" && item.rarity === "exotic") {
                changes.weapon_part1_name = "";
                changes.weapon_part2_name = "";
            }

            const changesKeys = [
                "weapon_cell0",
                "weapon_cell1"
            ];

            const cells = this.getCellsForKeys(changesKeys);

            if (Object.keys(cells).length && (item && item.cells)) {
                item.cells.forEach((slot, index) => {
                    const changesKey = changesKeys[index];
                    for (const cellKey in cells) {
                        const isPrismaticInvolved = cells[cellKey].slot === "Prismatic" || slot === "Prismatic";
                        if (cells[cellKey] && (cells[cellKey].slot === slot || isPrismaticInvolved)) {
                            changes[changesKey] = this.state.build[cellKey];
                            delete cells[cellKey];
                            break;
                        }
                    }
                });
            }
        } else if(itemType === "Armour") {
            const item = BuildModel.findArmour(itemName);
            let type = data.__armourType.toLowerCase();

            changes[`${type}_name`] = itemName;
            changes[`${type}_level`] = Math.min(level, ItemUtility.maxLevel("armours", itemName));

            const changesKey = `${type}_cell`;
            changes[changesKey] = "";

            if (item !== null) {
                const cells = this.getCellsForKeys([changesKey]);
                changes[changesKey] = cells[changesKey] && cells[changesKey].slot === item.cells ?
                    this.state.build[changesKey] : "";
            }

        } else if(itemType === "Lantern") {
            const item = BuildModel.findLantern(itemName);

            changes.lantern_name = itemName;
            changes.lantern_cell = "";

            if (item !== null) {
                const cells = this.getCellsForKeys(["lantern_cell"]);
                changes.lantern_cell = cells["lantern_cell"] && cells["lantern_cell"].slot === item.cells ?
                    this.state.build["lantern_cell"] : "";
            }
        } else if(itemType === "Cell") {
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

        // we've changed something, which means we can reset the flags!
        build.__flags = 0;

        // if you're looking at an old build and you change something its a new build!
        if (this.state.build.__version !== CURRENT_BUILD_ID) {
            build.__version = CURRENT_BUILD_ID;
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

    onBondItemSelected(itemName) {
        this.applyItemSelection({bond_weapon_name: itemName});
        this.onBondItemModalClosed();
    }

    onBondItemModalClosed() {
        this.onModalClosed();
        this.setState({bondItemModalOpen: false, modalData: {}});
    }

    onOmnicellClicked() {
        this.onModalOpen();
        this.setState({omnicellSelectModalOpen: true, modalData: {}});
    }

    onOmnicellSelected(itemName) {
        this.applyItemSelection({omnicell: itemName});
        this.onOmnicellModalClosed();
    }

    onOmnicellModalClosed() {
        this.onModalClosed();
        this.setState({omnicellSelectModalOpen: false, modalData: {}});
    }

    renderWeapon() {
        const weapon = BuildModel.findWeapon(this.state.build.weapon_name);

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
            ItemUtility.formatWeaponTypeForParts(weapon.type) in this.state.itemData.parts &&
            partName in this.state.itemData.parts[ItemUtility.formatWeaponTypeForParts(weapon.type)];

        let parts = [];

        const isRepeater = weapon.type === "Repeater";

        if (weaponHasParts("specials") && weapon.restrict_specials !== true && !isRepeater) {
            let slot = "weapon_part1_name";

            const part = BuildModel.findPart(weapon.type, "specials", this.state.build[slot]);

            parts.push(
                <WeaponPart key={weapon.type + "_special"} part={part} partType="specials" onClicked={
                    () => this.openWeaponPartSelectModal(weapon.type, "specials", slot)
                } />
            );
        }

        // exotic repeaters don't have chamber and grip
        if (isRepeater && weapon.rarity !== "exotic") {
            const chamberSlot = "weapon_part1_name";
            const chamber = BuildModel.findPart(weapon.type, "chambers", this.state.build[chamberSlot]);

            parts.push(
                <WeaponPart key={weapon.type + "_chamber"} part={chamber} partType="chambers" onClicked={
                    () => this.openWeaponPartSelectModal(weapon.type, "chambers", chamberSlot)
                } />
            );

            const gripSlot = "weapon_part2_name";
            const grip = BuildModel.findPart(weapon.type, "grips", this.state.build[gripSlot]);

            parts.push(
                <WeaponPart key={weapon.type + "_grip"} part={grip} partType="grips" onClicked={
                    () => this.openWeaponPartSelectModal(weapon.type, "grips", gripSlot)
                } />
            );
        }

        if (weaponHasParts("mods")) {
            let slot = isRepeater ? "weapon_part3_name" : "weapon_part2_name";

            const part = BuildModel.findPart(weapon.type, "mods", this.state.build[slot]);

            parts.push(
                <WeaponPart key={weapon.type + "_mod"} part={part} partType="mods" onClicked={
                    () => this.openWeaponPartSelectModal(weapon.type, "mods", slot)
                } />
            );
        }

        return parts;
    }

    renderWeaponBond() {
        if(BuildModel.findWeaponBondFilterRules(this.state.build.weapon_name) === null) {
            return null;
        }

        const openBondItemModal = () => {
            this.onModalOpen();
            this.setState({bondItemModalOpen: true});
        };

        return <Item
            parent={this}
            onItemClicked={openBondItemModal}
            title="Bond Weapon" defaultType="Weapon"
            item={BuildModel.findWeapon(this.state.build.bond_weapon_name)}
            level={this.state.build.weapon_level}
            titlePrefix="Bond"
            simpleView={true}
            renderUniqueEffectsBeforeItem={true} />;
    }

    getMetaTitle() {
        if (this.state.build.omnicell && this.state.build.weapon_name) {
            return this.state.build.weapon_name + " " + this.state.build.omnicell + " Build - Dauntless Builder";
        }

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
                <div className="column is-two-thirds build-column">
                    <BuildWarning build={this.state.build} />

                    <Omnicell
                        parent={this}
                        onItemClicked={this.onOmnicellClicked.bind(this)}
                        selected={this.state.build.omnicell} />

                    {this.renderWeapon()}
                    {this.renderWeaponBond()}
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
            <BondSelectModal
                weaponName={this.state.build.weapon_name}
                level={this.state.build.weapon_level}
                itemData={this.state.itemData}
                onSelected={this.onBondItemSelected.bind(this)}
                onCanceled={this.onBondItemModalClosed.bind(this)}
                isOpen={this.state.bondItemModalOpen} />
            <WeaponPartSelectModal
                data={this.state.modalData}
                itemData={this.state.itemData}
                onClosed={this.onWeaponPartSelectModalClosed.bind(this)}
                onSelected={this.onWeaponPartSelected.bind(this)}
                isOpen={this.state.weaponPartSelectModalOpen} />
            <OmnicellSelectModal
                itemData={this.state.itemData}
                onSelected={this.onOmnicellSelected.bind(this)}
                onCanceled={this.onOmnicellModalClosed.bind(this)}
                isOpen={this.state.omnicellSelectModalOpen} />
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
