import React from "react";
import PropTypes from "prop-types";

import CellGroup from "./CellGroup";
import ItemIcon from "./ItemIcon";

import PropTypeUtility from "../utility/PropTypeUtility";
import BuildModel from "../models/BuildModel";
import RepeaterPart from "./RepeaterPart";
import ItemUtility from "../utility/ItemUtility";
import UniqueEffects from "./UniqueEffects";

export default class Repeater extends React.Component {
    constructor(props, context) {
        super(props, context);

        this.state = {};
    }

    getTotalPower() {
        // non modular repeaters get normal level numbers
        if (this.props.item.name !== "Repeater") {
            return this.props.item.power[this.props.level];
        }

        let total = 0;

        const fields = [
            ["barrels", "part1"],
            ["chambers", "part2"],
            ["grips", "part3"],
            ["prisms", "part4"]
        ];

        for(let field of fields) {
            const partType = field[0];
            const partName = this.props.parent.state.build["weapon_" + field[1] + "_name"];

            const part = BuildModel.findPart("repeater", partType, partName);

            if(part) {
                total += part.power[this.props.level];
            }
        }

        return total;
    }

    onClicked() {
        let filterOption = {};
        filterOption.__itemType = "Weapon";
        filterOption.__weaponType = "Repeater";
        filterOption.filters = [];

        this.props.onItemClicked(filterOption);
    }

    onPartClicked(partType, fieldName) {
        this.props.parent.openRepeaterPartSelectModal(partType, fieldName);
    }

    renderPart(partType, fieldPrefix) {
        // non modular repeaters shouldn't have parts
        if (this.props.item.name !== "Repeater") {
            return null;
        }

        const fieldName = "weapon_" + fieldPrefix + "_name";

        const parts = this.props.parent.state.itemData.parts;

        if(!parts.repeater || !(partType in parts.repeater)) {
            return null;
        }

        const part = BuildModel.findPart("repeater", partType, this.props.parent.state.build[fieldName]);

        if(!part) {
            return <div className="item-title-wrapper">
                <div className="item-wrapper">
                    <div className="item no-item" onClick={() => this.onPartClicked(partType, fieldName)}>
                        <i className="fas fa-question no-item-icon"></i>
                        <div className="item-data">
                            <h3 className="subtitle">
                                No <strong>{partType.capitalize().substring(0, partType.length - 1)}</strong> selected.
                            </h3>
                            <div>Click here to select one.</div>
                        </div>
                    </div>
                </div>
            </div>;
        }

        return <RepeaterPart part={part} partType={partType}
            level={this.props.level}
            onClicked={() => this.onPartClicked(partType, fieldName)} />;
    }

    render() {
        const name = this.props.item.name === "Repeater" ? "Ostian Repeaters" : this.props.item.name;

        return <React.Fragment>
            <div className="item-title-wrapper">
                <h2 className="subtitle hidden-on-large-screens">Weapon</h2>
                <div className="item-wrapper">
                    <div className={"item item-repeater"+ (this.props.item.cells.length === 0 ? " no-cells" : "")} title={this.props.item.description} onClick={() => this.onClicked()}>
                        <ItemIcon item={this.props.item} defaultType={"Weapon"} />
                        <div className="item-data">
                            <h3 className="item-title">{name} {ItemUtility.levelString(this.props.level)}</h3>
                            <div className="stat-data">
                                <strong>Power</strong>: {this.getTotalPower()}
                            </div>
                        </div>
                    </div>
                    <CellGroup
                        item={this.props.item}
                        cells={this.props.cells}
                        defaultType={"Weapon"}
                        onCellClicked={this.props.onCellClicked}
                        parent={this.props.parent} />
                </div>
            </div>

            <UniqueEffects item={this.props.item} level={this.props.level} />

            {this.renderPart("barrels", "part1")}
            {this.renderPart("chambers", "part2")}
            {this.renderPart("grips", "part3")}
            {this.renderPart("prisms", "part4")}
        </React.Fragment>;
    }
}

Repeater.propTypes = {
    item: PropTypeUtility.item(),
    parent: PropTypes.object,
    level: PropTypes.number,
    cells: PropTypes.array,
    onItemClicked: PropTypes.func,
    onCellClicked: PropTypes.func
};
