import React from "react";
import PropTypes from "prop-types";
import ItemUtility from "../utility/ItemUtility";
import { FormattedMessage } from "react-intl";

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
        let filters = [
            {
                field: "slot",
                value: this.props.type
            }
        ];

        if (this.props.type === "Prismatic" || this.props.isPrismaticSlot) {
            filters = [];
        }

        this.props.onCellClicked({
            __itemType: "cell",
            __parentType: this.props.parentType,
            __slotPosition: this.props.slotPosition,
            filters});
    }

    render() {
        const { variant } = this.props;

        return <div className={"cell " + this.getRarity()} onClick={() => this.onClicked()}>
            <img src={"/assets/icons/perks/" + this.props.type + ".png"} />
            {variant && <span className="cell-title"><FormattedMessage id={ItemUtility.getTr("cells", this.props.variant)} /></span>}
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
