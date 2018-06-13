import React from "react";

import {Link} from "react-router-dom";

import {CopyToClipboard} from "react-copy-to-clipboard";

import BuildModel from "../models/BuildModel";
import DataUtil from "../utils/DataUtil";

import ItemComponent from "../components/ItemComponent";

export default class BuildView extends React.Component {

    constructor(props, context) {
        super(props, context);

        this.state = {
            ready: false
        };
    }

    componentDidMount() {
        const buildData = this.props.match.params.buildData;

        this.loadBuild(buildData);
    }

    loadBuild(buildData) {
        Promise.all([
            DataUtil.data(),
            BuildModel.tryDeserialize(buildData)
        ]).then(res => {
            let [itemData, build] = res;

            this.setState({
                itemData, build, buildData, ready: true
            });

            build.serialize().then(string => {
                console.log("Build ID: ", string);
            })
        });
    }

    updateUrl() {
        this.state.build.serialize().then(buildData => {
            window.history.replaceState({}, "Dauntless Builder: " + buildData, "/b/" + buildData);

            this.setState({
                buildData
            })
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

    findWeapon(name) {
        if(name in this.state.itemData.weapons) {
            return this.state.itemData.weapons[name];
        }

        return null;
    }

    findArmor(name) {
        if(name in this.state.itemData.armors) {
            return this.state.itemData.armors[name];
        }

        return null;
    }

    findLantern(name) {
        if(name in this.state.itemData.lanterns) {
            return this.state.itemData.lanterns[name];
        }

        return null;
    }

    findCellByVariantName(variantName) {
        for(let cellKey in this.state.itemData.cells) {
            let cell = this.state.itemData.cells[cellKey];

            if(variantName in cell.variants) {
                return cell;
            }
        }

        return null;
    }

    onCopyToClipboard() {
        console.log("Copied to clipboard:", window.location.origin + "/b/" + this.state.buildData)

        // TODO: add popup that says "copied"
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
                </div>
                <div className="qa-right">
                    <button onClick={() => this.dummyData()} className="button is-light">
                        <i className="fas fa-database"></i>&nbsp;Add Dummy Data
                    </button>
                    <CopyToClipboard text={window.location.origin + "/b/" + this.state.buildData} onCopy={() => this.onCopyToClipboard()}>
                        <button className="button is-light" title="Copy to clipboard">
                            <i className="fas fa-copy"></i>
                        </button>
                    </CopyToClipboard>
                    <button className="button is-light" title="Save build" disabled>
                        <i className="far fa-heart"></i>
                    </button>
                </div>
            </div>
            <div className="columns">
                <div className="column is-two-thirds">
                    <ItemComponent
                        parent={this}
                        title="Weapon"
                        item={this.findWeapon(this.state.build.weapon_name)}
                        level={this.state.build.weapon_level}
                        cells={[
                            [this.state.build.weapon_cell0, this.findCellByVariantName(this.state.build.weapon_cell0)],
                            [this.state.build.weapon_cell1, this.findCellByVariantName(this.state.build.weapon_cell1)],
                        ]} />

                    <ItemComponent
                        parent={this}
                        title="Head Armor"
                        item={this.findArmor(this.state.build.head_name)}
                        level={this.state.build.head_level}
                        cells={[
                            [this.state.build.head_cell, this.findCellByVariantName(this.state.build.head_cell)]
                        ]} />

                    <ItemComponent
                        parent={this}
                        title="Torso Armor"
                        item={this.findArmor(this.state.build.torso_name)}
                        level={this.state.build.torso_level}
                        cells={[
                            [this.state.build.torso_cell, this.findCellByVariantName(this.state.build.torso_cell)]
                        ]} />

                    <ItemComponent
                        parent={this}
                        title="Arms Armor"
                        item={this.findArmor(this.state.build.arms_name)}
                        level={this.state.build.arms_level}
                        cells={[
                            [this.state.build.arms_cell, this.findCellByVariantName(this.state.build.arms_cell)]
                        ]} />

                    <ItemComponent
                        parent={this}
                        title="Legs Armor"
                        item={this.findArmor(this.state.build.legs_name)}
                        level={this.state.build.legs_level}
                        cells={[
                            [this.state.build.legs_cell, this.findCellByVariantName(this.state.build.legs_cell)]
                        ]} />

                    <ItemComponent
                        parent={this}
                        title="Lantern"
                        item={this.findLantern(this.state.build.lantern_name)}
                        cells={[
                            [this.state.build.lantern_cell, this.findCellByVariantName(this.state.build.lantern_cell)]
                        ]} />
                </div>
                <div className="column is-one-third">
                    <br />
                    <pre><code>{JSON.stringify({build: this.state.build}, null, "    ")}</code></pre>
                </div>
            </div>
        </React.Fragment>;
    }
}