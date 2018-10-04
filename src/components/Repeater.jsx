import React from "react";
import PropTypes from "prop-types";

import CellGroup from "./CellGroup";
import ItemIcon from "./ItemIcon";

import PropTypeUtility from "../utility/PropTypeUtility";
import BuildModel from "../models/BuildModel";

export default class Repeater extends React.Component {
    constructor(props, context) {
        super(props, context);

        this.state = {
            totalPower: 0
        };
    }

    getTotalPower() {
        let total = 0;

        const fields = ["barrel", "chamber", "grip", "prism"];

        for(let field of fields) {
            const part = BuildModel.findPart("repeaters", field + "s", this.props.parent.state.build[field + "_name"]);
            const level = this.props.parent.state.build[field + "_level"];

            const value = part.power[level];

            if(value) {
                total += value;
            }
        }

        return total;
    }

    onClicked() {
        let filterOption = {};
        filterOption.__itemType = "Weapon";
        filterOption.filters = [];

        this.props.onItemClicked(filterOption);
    }

    onPartClicked(partType, fieldName) {
        const part = this.props.parent.state.itemData.parts["repeaters"][partType][
            Object.keys(this.props.parent.state.itemData.parts["repeaters"][partType])[0]
        ];

        this.props.parent.onPartSelected(fieldName, part.name);
    }

    renderPart(partType, fieldName) {
        const capitalize = string => string.charAt(0).toUpperCase() + string.slice(1);

        const parts = this.props.parent.state.itemData.parts;

        if(!parts.repeaters || !parts.repeaters[partType]) {
            return null;
        }

        const part = BuildModel.findPart("repeaters", partType, this.props.parent.state.build[fieldName]);

        if(!part) {
            return <div className="item-title-wrapper">
                <div className="item-wrapper">
                    <div className="item no-item" onClick={() => this.onPartClicked(partType, fieldName)}>
                        <i className="fas fa-question no-item-icon"></i>
                        <div className="item-data">
                            <h3 className="subtitle">
                                No <strong>{capitalize(partType).substring(0, partType.length - 1)}</strong> selected.
                            </h3>
                            <div>Click here to select one.</div>
                        </div>
                    </div>
                </div>
            </div>;
        }

        const maxLevel = Math.max(...Object.keys(part.power).map(k => Number(k)));
        const powerLevel = part.power[maxLevel];

        // TODO: make other parts selectable
        return <div className="item-title-wrapper">
            <h2 className="subtitle hidden-on-large-screens">{capitalize(partType)}</h2>
            <div className="item-wrapper">
                <div className="item repeater-part no-cells">
                    <div className="repeater-image-wrapper">
                        <img src={part.icon} />
                    </div>
                    <div className="item-data">
                        <h3 className="item-title">{part.name}</h3>
                        <div className="stat-data">
                            <strong>Power</strong>: {powerLevel}
                        </div>
                        {part.part_effect.map(e => <div key={e} className="unique-effects">{e}</div>)}
                    </div>
                </div>
            </div>
        </div>;
    }

    render() {
        return <React.Fragment>
            <div className="item-title-wrapper">
                <h2 className="subtitle hidden-on-large-screens">Weapon</h2>
                <div className="item-wrapper">
                    <div className={"item item-repeater"+ (this.props.item.cells.length === 0 ? " no-cells" : "")} title={this.props.item.description} onClick={() => this.onClicked()}>
                        <ItemIcon item={this.props.item} defaultType={"Weapon"} />
                        <div className="item-data">
                            <h3 className="item-title">Ostian Repeaters</h3>
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

            {this.renderPart("barrels", "barrel_name")}
            {this.renderPart("chambers", "chamber_name")}
            {this.renderPart("grips", "grip_name")}
            {this.renderPart("prisms", "prism_name")}
        </React.Fragment>;
    }
}

Repeater.propTypes = {
    item: PropTypeUtility.item(),
    parent: PropTypes.object,
    cells: PropTypes.array,
    onItemClicked: PropTypes.func,
    onCellClicked: PropTypes.func
};
