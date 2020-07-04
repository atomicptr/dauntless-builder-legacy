import React from "react";
import PropTypes from "prop-types";

import ModalItemListItem from "./ModalItemListItem";
import BuildModel from "../models/BuildModel";

export default class BondSelectModal extends React.Component {

    constructor(props, context) {
        super(props, context);

        this.state = {
            open: !!this.props.isOpen,
            itemData: this.props.itemData
        };

        this.defaultState = {
            open: false,
            itemData: null
        };
    }

    // TODO: refactor this, since componentWillReceiveProps is deprecated
    UNSAFE_componentWillReceiveProps(nextProps) {
        let newState = {};

        if(nextProps.isOpen !== this.state.open) {
            newState.open = nextProps.isOpen;
        }

        if(Object.keys(newState).length > 0) {
            this.setState(newState);
        }
    }

    onBondItemSelected(_, itemName) {
        let newState = Object.assign({}, this.defaultState);
        newState.open = false;

        this.setState(newState, () => {
            if(this.props.onSelected) {
                this.props.onSelected(itemName);
            }
        });
    }

    onClose() {
        this.setState(this.defaultState, () => {
            if(this.props.onCanceled) {
                this.props.onCanceled();
            }
        });
    }

    getIsActive() {
        return this.state.open ? "is-active" : "";
    }

    renderItem(item) {
        return <ModalItemListItem
            key={"Weapon-" + item.name}
            item={item}
            level={this.props.level}
            type={"Weapon"}
            hideCells={true}
            itemData={this.props.itemData}
            onSelected={this.onBondItemSelected.bind(this)} />;
    }

    getAvailableItems() {
        const weapon = BuildModel.findWeapon(this.props.weaponName);

        if(!weapon) {
            return [];
        }

        let bondFilter = {
            type: weapon.type
        };

        bondFilter = Object.assign(bondFilter, weapon.bond);

        return BuildModel.findItemsByMatchingFilter("Weapon", bondFilter)
            .filter(item => item.name !== this.props.weaponName)
            .filter(item => item.rarity !== "exotic");
    }

    getAvailableItemsRendered() {
        const items = this.getAvailableItems();
        return items.map(item => this.renderItem(item));
    }

    render() {
        if(!this.state.open) {
            return null;
        }

        let items = this.getAvailableItemsRendered();

        if(items.length === 0) {
            items.push(
                <div key="no-item-found" className="no-item-found">No items found matching your filter options.</div>
            );
        }

        return <div className={`modal ${this.getIsActive()}`}>
            <div className="modal-background" onClick={() => this.onClose()}></div>
            <div className="modal-content">
                <div className="card modal-card">
                    <div className="item-modal-list">
                        {items}
                    </div>

                    <footer className="modal-card-foot">
                        <div className="footer-right">
                            <button
                                className="button"
                                onClick={() =>
                                    this.onBondItemSelected(null, "")}>
                                Select&nbsp;<strong>No Bond Weapon</strong>.
                            </button>
                            <button className="button" onClick={() => this.onClose()}>Cancel</button>
                        </div>
                    </footer>
                </div>
            </div>
            <button className="modal-close is-large" onClick={() => this.onClose()}></button>
        </div>;
    }
}

BondSelectModal.propTypes = {
    isOpen: PropTypes.bool,
    onSelected: PropTypes.func,
    onCanceled: PropTypes.func,
    weaponName: PropTypes.string,
    level: PropTypes.number,
    itemData: PropTypes.shape({
        weapons: PropTypes.object
    })
};
