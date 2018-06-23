import React from "react";
import Select from "react-select";

require("react-select/dist/react-select.css");

import DebugComponent from "./DebugComponent";
import ModalCellListItemComponent from "./modal/ModalCellListItemComponent";
import ModalItemListItemComponent from "./modal/ModalItemListItemComponent";

export default class ItemSelectModalComponent extends React.Component {
    constructor(props, context) {
        super(props, context);

        this.state = {
            open: !!this.props.isOpen,
            searchQuery: "",
            perkFilter: null,
            weaponTypeFilter: null,
            slotFilter: null
        }

        this.defaultState = {
            open: false,
            searchQuery: "",
            perkFilter: null,
            weaponTypeFilter: null,
            slotFilter: null
        }
    }

    componentWillReceiveProps(nextProps) {
        if(nextProps.isOpen !== this.state.open) {
            this.setState({open: nextProps.isOpen});
        }

        if(nextProps.data && nextProps.data.filterOptions &&
                nextProps.data.filterOptions.__itemType === "Weapon" && nextProps.data.filterOptions.__weaponType) {
            this.setState({weaponTypeFilter: {
                    value: nextProps.data.filterOptions.__weaponType,
                    label: nextProps.data.filterOptions.__weaponType,
                }
            });
        }
    }

    getIsActive() {
        return this.state.open ? "is-active" : "";
    }

    onItemSelected(itemType, itemName) {
        let newState = Object.assign({}, this.defaultState);
        newState.open = false;

        this.setState(newState, () => {
            if(this.props.onSelected) {
                this.props.onSelected(itemType, itemName, this.props.data.filterOptions);
            }
        })
    }

    onClose() {
        this.setState(this.defaultState, () => {
            if(this.props.onCanceled) {
                this.props.onCanceled();
            }
        });
    }

    getAvailableItems() {
        let items = [];

        let itemType = this.props.data.filterOptions.__itemType;

        let key = null;

        switch(itemType) {
            case "Weapon": key = "weapons"; break;
            case "Armour": key = "armours"; break;
            case "Lantern": key = "lanterns"; break;
            case "Cell": key = "cells"; break;
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

                return item[filter.field] === filter.value
            });
        };

        let filterOptions = [];

        filterOptions = filterOptions.concat(this.props.data.filterOptions.filters);
        filterOptions = filterOptions.concat(this.getDynamicFilters());

        for(let itemName in this.props.itemData[key]) {
            let item = this.props.itemData[key][itemName];

            if(filtersApply(item, filterOptions)) {
                let itemsToRender = this["render" + itemType](item);

                if(!Array.isArray(itemsToRender)) {
                    itemsToRender = [itemsToRender];
                }

                itemsToRender.forEach(r => items.push(r));
            }
        }

        return items;
    }

    getDynamicFilters() {
        let filters = [];

        // apply search filter
        if(this.state.searchQuery.length > 0) {
            filters.push({
                field: ["name", "description"],
                value: this.state.searchQuery,
                method: (item, filter) => filter.field.some(f => {
                    if(!item[f]) {
                        return false;
                    }

                    return item[f].toLowerCase().indexOf(filter.value.toLowerCase()) > -1;
                })
            });
        }

        if(this.state.perkFilter && this.state.perkFilter.value) {
            filters.push({
                field: "perks",
                value: this.state.perkFilter.value,
                method: (item, filter) =>
                    item.perks.some(p => p.name === filter.value)
            });
        }

        if(this.props.data.filterOptions.__itemType === "Weapon" && this.state.weaponTypeFilter && this.state.weaponTypeFilter.value) {
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

        // apply tier filter
        if(this.props.data.filterOptions.__itemType === "Weapon" || this.props.data.filterOptions.__itemType === "Armour") {
            filters.push({
                field: "tier",
                value: 5
            });
        }

        return filters;
    }

    getPerkOptions() {
        let perks = Object.keys(this.props.itemData.perks).map(perk => {
            return {value: perk, label: perk};
        });

        return perks;
    }

    renderFilterFields() {
        let fields = [];

        const isType = (type) => {
            if(!Array.isArray(type)) {
                type = [type];
            }

            return type.indexOf(this.props.data.filterOptions.__itemType) > -1;
        }

        // add search filter
        fields.push(
            <div key="searchFilter" className="field">
                <p className="control has-icons-left has-icons-right">
                    <input
                        autoFocus={window.innerWidth >= 700}
                        className="input"
                        type="text"
                        placeholder="Search..."
                        value={this.state.searchQuery}
                        onChange={e => this.setState({searchQuery: e.target.value})} />
                    <span className="icon is-small is-left">
                        <i className="fas fa-search"></i>
                    </span>
                </p>
            </div>
        );

        // add Weapon Type filter
        if(isType(["Weapon"])) {
            let options = [];

            for(let weaponName in this.props.itemData.weapons) {
                let weapon = this.props.itemData.weapons[weaponName];

                if(weapon.type && options.indexOf(weapon.type) == -1) {
                    options.push(weapon.type);
                }
            }

            options = options.sort().map(option => ({value: option, label: option}));

            fields.push(
                <div key="weaponTypeFilter" className="field">
                    <Select
                        placeholder="Filter by weapon type..."
                        onChange={weaponType => this.setState({weaponTypeFilter: weaponType})}
                        value={this.state.weaponTypeFilter}
                        options={options} />
                </div>
            );
        }

        // add Perk filter
        if(isType(["Weapon", "Armour"])) {
            fields.push(
                <div key="perkFilter" className="field">
                    <Select
                        placeholder="Filter by perk..."
                        onChange={perk => this.setState({perkFilter: perk})}
                        value={this.state.perkFilter}
                        options={this.getPerkOptions()} />
                </div>
            );
        }

        // add Slot filter
        if(isType(["Weapon", "Armour"])) {
            fields.push(
                <div key="slotFilter" className="field">
                    <Select
                        placeholder="Filter by cell slot..."
                        onChange={slot => this.setState({slotFilter: slot})}
                        value={this.state.slotFilter}
                        options={["Defence", "Mobility", "Power", "Technique", "Utility"].map(
                            slot => ({value: slot, label: slot}))} />
                </div>
            )
        }

        return fields;
    }

    renderWeapon(item) {
        return this.renderItem(item, "Weapon");
    }

    renderArmour(item) {
        return this.renderItem(item, "Armour");
    }

    renderLantern(item) {
        return this.renderItem(item, "Lantern");
    }

    renderItem(item, type) {
        return <ModalItemListItemComponent
            key={type + "-" + item.name}
            item={item}
            type={type}
            itemData={this.props.itemData}
            onSelected={this.onItemSelected.bind(this)} />;
    }

    renderCell(item) {
        return <ModalCellListItemComponent
            key={"Cell-" + item.name}
            item={item}
            itemData={this.props.itemData}
            onSelected={this.onItemSelected.bind(this)} />;
    }

    render() {
        if(!this.state.open) {
            return null;
        }

        let items = this.getAvailableItems();

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

                    <footer className="modal-card-foot">
                        <DebugComponent data={{filterOptions: this.props.data.filterOptions, state: this.state}} />
                        <button
                            className="button"
                            onClick={() =>
                                this.onItemSelected(this.props.data.filterOptions.__itemType, "")}>
                            Select&nbsp;<strong>No {this.props.data.filterOptions.__itemType}</strong>.
                        </button>
                        <button className="button" onClick={() => this.onClose()}>Cancel</button>
                    </footer>
                </div>
            </div>
            <button className="modal-close is-large" onClick={() => this.onClose()}></button>
        </div>;
    }
}