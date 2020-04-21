import React from "react";
import PropTypes from "prop-types";

export default class Cell extends React.Component {
    constructor(props, context) {
        super(props, context);
    }

    getRarity() {
        if(this.props.cell) {
            return this.props.cell.variants[this.props.variant].rarity;
        }

        return "empty";
    }

    onClicked() {
        let filterOption = {};
        filterOption.__itemType = "Cell";
        filterOption.__parentType = this.props.parentType;
        filterOption.__slotPosition = this.props.slotPosition;

        filterOption.filters = [
            {
                field: "slot",
                value: this.props.type
            }
        ];

        if(this.props.cell) {
            filterOption.__rarity = this.getRarity();
        }

        if (this.props.type === "Prismatic" || this.props.isPrismaticSlot) {
            filterOption.filters = [];
        }

        this.props.onCellClicked(filterOption);
    }

    render() {

        return <div className={"cell " + this.getRarity()} onClick={() => this.onClicked()}>
            <img src={"/assets/icons/perks/" + this.props.type + ".png"} />
            <span className="cell-title">{this.props.variant}</span>
        </div>;
    }
}

Cell.propTypes = {
    cell: PropTypes.object,
    variant: PropTypes.string,
    parentType: PropTypes.string,
    type: PropTypes.string,
    onCellClicked: PropTypes.func,
    slotPosition: PropTypes.number,
    isPrismaticSlot: PropTypes.bool
};
