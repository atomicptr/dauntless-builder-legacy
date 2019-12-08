import React from "react";
import PropTypes from "prop-types";

import ItemIcon from "./ItemIcon";
import ItemData from "./ItemData";
import ItemUtility from "../utility/ItemUtility";
import PropTypeUtility from "../utility/PropTypeUtility";

export default class ModalItemListItem extends React.Component {
    getLevel() {
        if(this.props.type === "lantern") {
            return 0;
        }

        if(ItemUtility.isRepeater(this.props.item)) {
            return 0;
        }

        const itemType = ItemUtility.itemType(this.props.item.type);

        const level = Math.min(
            this.props.level,
            ItemUtility.maxLevel(
                itemType === "weapon" ? "weapons" : "armours",
                this.props.item.name
            )
        );

        return level;
    }

    render() {
        const item = this.props.item;
        const type = this.props.type;
        const level = this.getLevel();
        const hideCells = this.props.hideCells === true;

        return <div className="item-title-wrapper">
            <div className="item-wrapper">
                <div className="item" title={item.description} onClick={() => this.props.onSelected(type, item.name)}>
                    <ItemIcon item={item} defaultType={ItemUtility.itemType(this.props.item.type)} />
                    <ItemData item={item} level={level} renderCellLine={!hideCells} />
                </div>
            </div>
        </div>;
    }
}

ModalItemListItem.propTypes = {
    type: PropTypes.string,
    item: PropTypeUtility.item(),
    level: PropTypes.number,
    hideCells: PropTypes.bool,
    onSelected: PropTypes.func
};
