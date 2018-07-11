import React from "react";

import CellComponent from "./CellComponent";
import BuildModel from "../models/BuildModel";

import ItemIconComponent from "./ItemIconComponent";

export default class ItemComponent extends React.Component {
    constructor(props, context) {
        super(props, context);

        this.state = {};
    }

    getPerks() {
        return BuildModel.getAvailablePerksByLevel(this.props.item.name, this.getItemType(), this.props.level);
    }

    getItemType() {
        let type = this.props.defaultType;

        if(this.props.item) {
            type = this.props.item.type;
        }

        switch(type) {
            case "Weapon":
            case "Sword":
            case "Chain Blades":
            case "Axe":
            case "Hammer":
            case "War Pike":
                return "Weapon"
            case "Head":
            case "Torso":
            case "Arms":
            case "Legs":
                return "Armour"
        }

        return "Lantern";
    }

    onClicked() {
        let filterOption = {};
        filterOption.__itemType = this.getItemType();
        filterOption.filters = [];

        if(filterOption.__itemType === "Weapon" && this.props.item) {
            filterOption.__weaponType = this.props.item.type;
            filterOption.__tier = 5;

            if(this.props.item.tier) {
                filterOption.__tier = this.props.item.tier;
            }
        }

        if(filterOption.__itemType === "Armour") {
            filterOption.__armourType = this.props.defaultType;
            filterOption.__tier = 5;

            if(this.props.item && this.props.item.tier) {
                filterOption.__tier = this.props.item.tier;
            }

            filterOption.filters.push({
                field: "type",
                value: this.props.defaultType
            });
        }

        this.props.onItemClicked(filterOption);
    }

    renderElementalAffinities() {
        let strength = null;
        let weakness = null;

        if(this.getItemType() === "Weapon" && this.props.item.elemental) {
            strength = <span className="elemental elemental-strength">
                +&nbsp;<img src={"/assets/icons/elements/" + this.props.item.elemental + ".png"} />
                <span className="only-desktop">&nbsp;{this.props.item.elemental}</span>
            </span>;
        }

        if(this.getItemType() === "Armour") {
            if(this.props.item.strength) {
                strength = <span className="elemental elemental-strength">
                    +&nbsp;<img src={"/assets/icons/elements/" + this.props.item.strength + ".png"} />
                    <span className="only-desktop">&nbsp;{this.props.item.strength}</span>
                </span>;
            }

            if(this.props.item.weakness) {
                weakness = <span className="elemental elemental-weakness">
                    -&nbsp;<img src={"/assets/icons/elements/" + this.props.item.weakness + ".png"} />
                    <span className="only-desktop">&nbsp;{this.props.item.weakness}</span>
                </span>;
            }
        }

        if(!strength && !weakness) {
            return null;
        }

        return <span className="elementals">
            {strength}
            {weakness}
        </span>
    }

    renderCells() {
        let cells = [];
        let cellCounter = 0;

        let cellSlots = this.props.item.cells;

        if(!this.props.item.cells) {
            return [];
        }

        if(!Array.isArray(cellSlots)) {
            cellSlots = [cellSlots];
        }

        let assignedCells = this.props.cells.slice();

        let slotIndex = 0;

        for(let slot of cellSlots) {
            let index = assignedCells.findIndex(cellHandle => cellHandle[1] && cellHandle[1].slot === slot);

            if(index > -1) {
                cells.push(
                    <CellComponent
                        parent={this.props.parent}
                        parentType={this.props.defaultType}
                        slotPosition={slotIndex}
                        onCellClicked={this.props.onCellClicked}
                        key={"cell_" + (cellCounter++)}
                        type={assignedCells[index][1].slot}
                        variant={assignedCells[index][0]}
                        cell={assignedCells[index][1]} />
                );

                assignedCells.splice(index, 1);
            } else {
                cells.push(
                    <CellComponent
                        parent={this.props.parent}
                        parentType={this.props.defaultType}
                        slotPosition={slotIndex}
                        onCellClicked={this.props.onCellClicked}
                        key={"cell_" + (cellCounter++)}
                        type={slot} />
                );
            }

            slotIndex++;
        }

        return cells;
    }

    render() {
        if(!this.props.item) {
            return <div className="item-title-wrapper">
                <div className="item-wrapper">
                    <div className="item no-item" onClick={() => this.onClicked()}>
                        <i className="fas fa-question no-item-icon"></i>
                        <div className="item-data">
                            <h3 className="subtitle">No <strong>{this.props.title}</strong> selected.</h3>
                            <div>Click here to select one.</div>
                        </div>
                    </div>
                </div>
            </div>
        }

        let cells = this.renderCells();

        let levelString = "";

        if(this.props.level && this.props.level > 0) {
            levelString = `+${this.props.level}`;
        }

        let perkElement = null;

        let perks = this.getPerks().map(perk => `+${perk.value} ${perk.name}`);

        if(perks.length > 0) {
            perkElement = <div><strong>Perks</strong>: {perks.join(", ")}</div>;
        }

        let stats = null;

        switch(this.getItemType()) {
            case "Weapon":
                stats = <React.Fragment>
                    <div className="stat-data"><strong>Power</strong>: {this.props.item.power[this.props.level]} {this.renderElementalAffinities()}</div>
                    {perkElement}
                </React.Fragment>;
                break;
            case "Armour":
                stats = <React.Fragment>
                    <div className="stat-data"><strong>Resistance</strong>: {this.props.item.resistance[this.props.level]} {this.renderElementalAffinities()}</div>
                    {perkElement}
                </React.Fragment>;
                break;
            case "Lantern":
                let instant = null;
                let hold = null;

                if(this.props.item.lantern_ability.instant) {
                    instant = <div><strong>Instant</strong>: {this.props.item.lantern_ability.instant}</div>;
                }

                if(this.props.item.lantern_ability.hold) {
                    hold = <div><strong>Hold</strong>: {this.props.item.lantern_ability.hold}</div>;
                }

                stats = <React.Fragment>
                    {instant}
                    {hold}
                    {perkElement}
                </React.Fragment>;
        }

        let uniqueEffects = [];

        if(this.props.item.unique_effects) {
            uniqueEffects = BuildModel.getAvailableUniqueEffectsByLevel(this.props.item.name, this.getItemType(), this.props.level).map(uniqueEffect =>
                <div key={uniqueEffect.name} className="unique-effects">{uniqueEffect.description}</div>);
        }

        return <div className="item-title-wrapper">
            <h2 className="subtitle hidden-on-large-screens">{this.getItemType() + (this.props.item.type ? ` - ${this.props.item.type}` : "")}</h2>
            <div className="item-wrapper">
                <div className={"item"+ (cells.length === 0 ? " no-cells" : "")} title={this.props.item.description} onClick={() => this.onClicked()}>
                    <ItemIconComponent item={this.props.item} defaultType={this.props.defaultType} />
                    <div className="item-data">
                        <h3 className="item-title">{this.props.item.name} {levelString}</h3>
                        {stats}
                        {uniqueEffects}
                    </div>
                </div>
                <div className="cells">
                    {cells}
                </div>
            </div>
        </div>;
    }
}