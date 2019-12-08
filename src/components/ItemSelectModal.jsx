import React from "react";
import PropTypes from "prop-types";

import Select from "react-select";

import Case from "case";

import "react-select/dist/react-select.css";

import Debug from "./Debug";
import ModalCellListItem from "./ModalCellListItem";
import ModalItemListItem from "./ModalItemListItem";
import LevelPicker from "./LevelPicker";
import ItemUtility from "../utility/ItemUtility";
import { injectIntl } from "react-intl";

class ItemSelectModal extends React.Component {
    constructor(props, context) {
        super(props, context);

        this.state = {
            open: !!this.props.isOpen,
            searchQuery: "",
            perkFilter: null,
            weaponTypeFilter: null,
            slotFilter: null,
            rarityFilter: null,
            levelPickerValue: null
        };

        this.defaultState = {
            open: false,
            searchQuery: "",
            perkFilter: null,
            weaponTypeFilter: null,
            slotFilter: null,
            rarityFilter: null,
            levelPickerValue: null
        };
    }

    // TODO: refactor this, since componentWillReceiveProps is deprecated
    UNSAFE_componentWillReceiveProps(nextProps) {
        let newState = {};

        if(nextProps.isOpen !== this.state.open) {
            newState.open = nextProps.isOpen;
        }

        if(nextProps.data && nextProps.data.filterOptions &&
            nextProps.data.filterOptions.__itemType === "weapon" && nextProps.data.filterOptions.__weaponType) {

            newState.weaponTypeFilter = {
                value: nextProps.data.filterOptions.__weaponType,
                label: this.tr(`builder.weaponType.${nextProps.data.filterOptions.__weaponType}`),
            };
        }

        if(Object.keys(newState).length > 0) {
            this.setState(newState);
        }
    }

    tr(id, ...args) {return this.props.intl.formatMessage({id}, ...args);}

    getIsActive() {
        return this.state.open ? "is-active" : "";
    }

    onItemSelected(itemType, itemName) {
        const selectedLevel = this.getSelectedLevel();

        let newState = Object.assign({}, this.defaultState);
        newState.open = false;

        this.setState(newState, () => {
            if(this.props.onSelected) {
                this.props.onSelected(itemType, itemName, selectedLevel, this.props.data.filterOptions);
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

    getSelectedLevel() {
        if (this.state.levelPickerValue !== null) {
            return this.state.levelPickerValue;
        }

        if (this.props.data && this.props.data.filterOptions && this.props.data.filterOptions.__itemLevel) {
            return this.props.data.filterOptions.__itemLevel;
        }

        return 15;
    }

    getAvailableItems(ignoredFilters = []) {
        let items = [];

        let itemType = this.props.data.filterOptions.__itemType;

        let key = null;

        switch(itemType) {
            case "weapon": key = "weapons"; break;
            case "armour": key = "armours"; break;
            case "lantern": key = "lanterns"; break;
            case "cell": key = "cells"; break;
        }

        const filtersApply = (item, filters) => {
            return filters.every(filter => {
                if(filter.method) {
                    try {
                        return filter.method(item, filter);
                    } catch(ex) {
                        console.warn(ex);
                        return false;
                    }
                }

                return item[filter.field] === filter.value;
            });
        };

        let filterOptions = [];

        filterOptions = filterOptions.concat(this.props.data.filterOptions.filters);
        filterOptions = filterOptions.concat(this.getDynamicFilters());

        for(let ignoredFilter of ignoredFilters) {
            const index = filterOptions.findIndex(f => f.field === ignoredFilter);

            if(index > -1) {
                filterOptions.splice(index, 1);
            }
        }

        for(let itemName in this.props.itemData[key]) {
            let item = this.props.itemData[key][itemName];

            if(filtersApply(item, filterOptions)) {
                items.push(item);
            }
        }

        return items;
    }

    getDynamicFilters() {
        const tr = this.tr.bind(this);
        let filters = [];

        // apply search filter for weapon and armour
        if(this.isType(["weapon", "armour"]) && this.state.searchQuery.length > 0) {
            filters.push({
                value: this.state.searchQuery,
                method: (item, filter) => {
                    const q = filter.value.toLowerCase();

                    return [
                        q => tr(ItemUtility.itemTr(item, "name")).toLowerCase().indexOf(q) > -1,
                        q => tr(ItemUtility.itemTr(item, "description")).toLowerCase().indexOf(q) > -1,
                        q => item.unique_effects && item.unique_effects.some(ue =>
                            ue.name && tr(ItemUtility.itemTr(item, ue.name, "description")).toLowerCase().indexOf(q) > -1),
                    ].some(test => test(q));
                }
            });
        }

        // apply search filter for cells
        if(this.isType(["cell"]) && this.state.searchQuery.length > 0) {
            filters.push({
                value: this.state.searchQuery,
                method: (item, filter) => {
                    const q = filter.value.toLowerCase();
                    const {itemData} = this.props;

                    let itemPerks = Object.keys(item.variants).map(v => Object.keys(item.variants[v].perks));
                    itemPerks = [].concat(...itemPerks);
                    itemPerks = itemPerks.filter((p, index) => itemPerks.indexOf(p) === index);

                    return [
                        q => tr(ItemUtility.getTr("cells", item.name)).toLowerCase().indexOf(q) > -1,
                        q => itemPerks.some(p => tr(ItemUtility.getTr("perks", p, "name")).toLowerCase().indexOf(q) > -1 ||
                        tr(ItemUtility.getTr("perks", p, "description")).toLowerCase().indexOf(q) > -1)
                    ].some(test => test(q));
                }
            });
        }

        // apply search filter for lanterns
        if(this.isType(["lantern"]) && this.state.searchQuery.length > 0) {
            filters.push({
                value: this.state.searchQuery,
                method: (item, filter) => {
                    const q = filter.value.toLowerCase();

                    return [
                        q => tr(ItemUtility.itemTr(item, "name")).toLowerCase().indexOf(q) > -1,
                        q => item.lantern_ability.instant && tr(ItemUtility.itemTr(item, "lanternAbility", "instant")).toLowerCase().indexOf(q) > -1,
                        q => item.lantern_ability.hold && tr(ItemUtility.itemTr(item, "lanternAbility", "hold")).toLowerCase().indexOf(q) > -1,
                    ].some(test => test(q));
                }
            });
        }

        if(this.state.perkFilter && this.state.perkFilter.value) {
            filters.push({
                field: "perks",
                value: this.state.perkFilter.value,
                method: (item, filter) =>
                    item.perks && item.perks.some(p => p.name === filter.value)
            });
        }

        if(this.isType("weapon") && this.state.weaponTypeFilter && this.state.weaponTypeFilter.value) {
            filters.push({
                field: "type",
                value: this.state.weaponTypeFilter.value
            });
        }

        if(this.state.slotFilter && this.state.slotFilter.value) {
            filters.push({
                field: "cells",
                value: this.state.slotFilter.value,
                method: (item, filter) => {
                    let cells = Array.isArray(item.cells) ? item.cells : [item.cells];
                    return cells.some(slotType => filter.value === slotType);
                }
            });
        }

        filters.push({
            field: "hidden",
            value: false,
            method: item => {
                if(item.hidden && !window.isDeveloperModeEnabled()) {
                    return false;
                }

                return true;
            }
        });

        return filters;
    }

    getPerkOptions() {
        let perks = Object.keys(this.props.itemData.perks).map(perk => {
            return {value: perk, label: this.tr(ItemUtility.getTr("perks", perk, "name"))};
        });

        return perks.filter(perk => {
            let items = this.getAvailableItems(["perks"]);

            return items.some(item => item.perks && item.perks.some(p => p.name === perk.value));
        });
    }

    getSlotOptions() {
        const slots = ["Defence", "Mobility", "Power", "Technique", "Utility"];

        return slots.filter(slot => {
            let items = this.getAvailableItems(["cells"]);

            return items.some(item => {
                let cells = Array.isArray(item.cells) ? item.cells : [item.cells];
                return cells.some(cellSlot => cellSlot === slot);
            });
        }).map(slot => ({value: slot, label: this.tr(`builder.cellSlot.${slot.toLowerCase()}`)}));
    }

    isType(type) {
        if(!Array.isArray(type)) {
            type = [type];
        }

        return type.indexOf(this.props.data.filterOptions.__itemType) > -1;
    }

    renderFilterFields() {
        const tr = this.tr.bind(this);
        let fields = [];

        // add search filter
        fields.push(
            <div key="searchFilter" className="field">
                <p className="control has-icons-left has-icons-right">
                    <input
                        autoFocus={window.innerWidth >= 700}
                        className="input"
                        type="text"
                        placeholder={tr("builder.modal.search")}
                        value={this.state.searchQuery}
                        onChange={e => this.setState({searchQuery: e.target.value})} />
                    <span className="icon is-small is-left">
                        <i className="fas fa-search"></i>
                    </span>
                </p>
            </div>
        );

        // add Weapon Type filter
        if(this.isType(["weapon"])) {
            let options = [];

            for(let weaponName in this.props.itemData.weapons) {
                let weapon = this.props.itemData.weapons[weaponName];

                if(weapon.type && options.indexOf(weapon.type) == -1) {
                    if(weapon.hidden && !window.isDeveloperModeEnabled()) {
                        continue;
                    }

                    options.push(weapon.type);
                }
            }

            options = options.sort().map(option => ({value: option, label: tr(`builder.weaponType.${option}`)}));

            fields.push(
                <div key="weaponTypeFilter" className="field">
                    <Select
                        placeholder={tr("builder.modal.weaponType")}
                        onChange={weaponType => this.setState({weaponTypeFilter: weaponType})}
                        value={this.state.weaponTypeFilter}
                        options={options} />
                </div>
            );
        }

        // add Perk filter
        const perkOptions = this.getPerkOptions();
        if(this.isType(["weapon", "armour"]) && perkOptions.length > 0) {
            fields.push(
                <div key="perkFilter" className="field is-hidden-touch">
                    <Select
                        placeholder={tr("builder.modal.perk")}
                        onChange={perk => this.setState({perkFilter: perk})}
                        value={this.state.perkFilter}
                        options={perkOptions} />
                </div>
            );
        }

        // add Slot filter
        const slotOptions = this.getSlotOptions();
        if(this.isType(["weapon", "armour"]) && slotOptions.length > 0) {
            fields.push(
                <div key="slotFilter" className="field is-hidden-touch">
                    <Select
                        placeholder={tr("builder.modal.cellSlot")}
                        onChange={slot => this.setState({slotFilter: slot})}
                        value={this.state.slotFilter}
                        options={slotOptions} />
                </div>
            );
        }

        // add cell rarity filter
        if(this.isType(["cell"])) {
            fields.push(
                <div key="rarityFilter" className="field is-hidden-touch">
                    <Select
                        placeholder={tr("builder.modal.rarity")}
                        onChange={rarity => this.setState({rarityFilter: rarity})}
                        value={this.state.rarityFilter}
                        options={["uncommon", "rare", "epic"].map(
                            rarity => ({value: rarity, label: this.tr(`builder.rarity.${rarity}`)}))} />
                </div>
            );
        }

        return fields;
    }

    getAvailableItemsRendered() {
        let items = this.getAvailableItems();

        let renderables = [];

        let itemType = this.props.data.filterOptions.__itemType;

        for(let item of items) {
            let itemsToRender = this["render" + Case.pascal(itemType)](item);

            if(!Array.isArray(itemsToRender)) {
                itemsToRender = [itemsToRender];
            }

            itemsToRender.forEach(r => renderables.push(r));
        }

        return renderables;
    }

    renderWeapon(item) {
        return this.renderItem(item, "weapon");
    }

    renderArmour(item) {
        return this.renderItem(item, "armour");
    }

    renderLantern(item) {
        return this.renderItem(item, "lantern");
    }

    renderItem(item, type) {
        return <ModalItemListItem
            key={type + "-" + item.name}
            item={item}
            level={this.getSelectedLevel()}
            type={type}
            itemData={this.props.itemData}
            onSelected={this.onItemSelected.bind(this)} />;
    }

    renderCell(item) {
        return <ModalCellListItem
            key={"Cell-" + item.name}
            item={item}
            itemData={this.props.itemData}
            onSelected={this.onItemSelected.bind(this)}
            rarityFilter={this.state.rarityFilter} />;
    }

    renderLevelPicker() {
        if (!this.isType(["Weapon", "Armour"])) {
            return null;
        }

        return <LevelPicker
            level={this.getSelectedLevel()}
            onValueChanged={val => this.setState({levelPickerValue: val})} />;
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
                    {this.renderFilterFields()}

                    <div className="item-modal-list">
                        {items}
                    </div>

                    <Debug data={{filterOptions: this.props.data.filterOptions, state: this.state}} />

                    <footer className="modal-card-foot">
                        <div className="footer-left">
                            {this.renderLevelPicker()}
                        </div>

                        <div className="footer-right">
                            <button
                                className="button"
                                onClick={() =>
                                    this.onItemSelected(this.props.data.filterOptions.__itemType, "")}>
                                Select&nbsp;<strong>No {this.props.data.filterOptions.__itemType}</strong>.
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

ItemSelectModal.propTypes = {
    isOpen: PropTypes.bool,
    onSelected: PropTypes.func,
    onCanceled: PropTypes.func,
    buildData: PropTypes.object,
    data: PropTypes.shape({
        filterOptions: PropTypes.object
    }),
    itemData: PropTypes.shape({
        weapons: PropTypes.object,
        perks: PropTypes.object
    }),
    intl: PropTypes.shape({
        formatMessage: PropTypes.func.isRequired
    }).isRequired
};

export default injectIntl(ItemSelectModal);