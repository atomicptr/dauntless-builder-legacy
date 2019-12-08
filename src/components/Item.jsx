import React from "react";
import PropTypes from "prop-types";
import { FormattedHTMLMessage, FormattedMessage, injectIntl } from "react-intl";

import CellGroup from "./CellGroup";

import ItemIcon from "./ItemIcon";
import ItemData from "./ItemData";
import ItemUtility from "../utility/ItemUtility";
import PropTypeUtility from "../utility/PropTypeUtility";
import UniqueEffects from "./UniqueEffects";

class Item extends React.Component {
    constructor(props, context) {
        super(props, context);

        this.state = {};
    }

    getItemType() {
        let type = this.props.defaultType;

        if(this.props.item) {
            type = this.props.item.type;
        }

        return ItemUtility.itemType(type);
    }

    onClicked() {
        let filterOption = {};
        filterOption.__itemType = this.getItemType();
        filterOption.__itemLevel = this.props.level;
        filterOption.filters = [];

        if(filterOption.__itemType === "weapon" && this.props.item) {
            filterOption.__weaponType = this.props.item.type;
        }

        if(filterOption.__itemType === "armour") {
            filterOption.__armourType = this.props.defaultType;

            filterOption.filters.push({
                field: "type",
                value: this.props.defaultType
            });
        }

        this.props.onItemClicked(filterOption);
    }

    tr(id, ...args) {
        return this.props.intl.formatMessage({id}, ...args);
    }

    render() {
        if(!this.props.item) {
            return <div className="item-title-wrapper">
                <div className="item-wrapper">
                    <div className="item no-item" onClick={() => this.onClicked()}>
                        <i className="fas fa-question no-item-icon"></i>
                        <div className="item-data">
                            <h3 className="subtitle"><FormattedHTMLMessage id="builder.noItemSelected" values={{title: this.props.title}} /></h3>
                            <div><FormattedMessage id="builder.clickToSelect"/></div>
                        </div>
                    </div>
                </div>
            </div>;
        }

        const hasCells = this.props.item.cells && this.props.item.cells.length > 0;

        const cellGroup = hasCells && !this.props.simpleView ?
            <CellGroup
                item={this.props.item}
                cells={this.props.cells}
                defaultType={this.props.defaultType}
                onCellClicked={this.props.onCellClicked}
                parent={this.props.parent} /> : null;

        const ueElement = <UniqueEffects item={this.props.item} level={this.props.level} />;
        const ueBefore = this.props.renderUniqueEffectsBeforeItem === true ? ueElement : null;
        const ueAfter = this.props.renderUniqueEffectsBeforeItem !== true ? ueElement : null;

        return <React.Fragment>
            {ueBefore}
            <div className="item-title-wrapper">
                <h2 className="subtitle hidden-on-large-screens">{this.getItemType() + (this.props.item.type ? ` - ${this.props.item.type}` : "")}</h2>
                <div className="item-wrapper">
                    <div className={"item"+ (!hasCells ? " no-cells" : "")} title={this.tr(ItemUtility.itemTr(this.props.item, "description"))} onClick={() => this.onClicked()}>
                        <ItemIcon item={this.props.item} defaultType={this.props.defaultType} />
                        <ItemData
                            titlePrefix={this.props.titlePrefix}
                            item={this.props.item}
                            level={this.props.level}
                            simpleView={this.props.simpleView} />
                    </div>
                    {cellGroup}
                </div>
            </div>
            {ueAfter}
        </React.Fragment>;
    }
}

Item.propTypes = {
    item: PropTypeUtility.item(),
    title: PropTypes.string,
    parent: PropTypes.object,
    cells: PropTypes.oneOfType([PropTypes.array, PropTypes.any]),
    defaultType: PropTypes.string,
    level: PropTypes.number,
    onItemClicked: PropTypes.func,
    onCellClicked: PropTypes.oneOfType([PropTypes.func, PropTypes.any]),
    titlePrefix: PropTypes.oneOfType([PropTypes.string, PropTypes.any]),
    simpleView: PropTypes.bool,
    renderUniqueEffectsBeforeItem: PropTypes.bool,
    intl: PropTypes.shape({
        formatMessage: PropTypes.func.isRequired
    }).isRequired
};

export default injectIntl(Item);