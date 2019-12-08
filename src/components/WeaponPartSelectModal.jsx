import React from "react";
import PropTypes from "prop-types";
import WeaponPart from "./WeaponPart";
import ItemUtility from "../utility/ItemUtility";

export default class WeaponPartSelectModal extends React.Component {
    constructor(props, context) {
        super(props, context);

        this.state = {
            open: !!this.props.isOpen,
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

    onClose() {
        this.setState({open: false}, () => {
            if(this.props.onClosed) {
                this.props.onClosed();
            }
        });
    }

    getIsActive() {
        return this.state.open ? "is-active" : "";
    }

    getAvailableParts() {
        const {partType, weaponType} = this.props.data;

        let items = [];

        const parts = this.props.itemData.parts[ItemUtility.formatWeaponTypeForParts(weaponType)][partType];

        for(let partName of Object.keys(parts)) {
            const part = parts[partName];

            items.push(
                <WeaponPart key={partName} part={part} weaponType={weaponType} partType={partType} onClicked={this.onPartSelected.bind(this)} />
            );
        }

        return items;
    }

    onPartSelected(part) {
        if(this.props.onSelected) {
            const {fieldName} = this.props.data;
            this.props.onSelected(fieldName.split("_name")[0], part);
        }
    }

    render() {
        if(!this.state.open) {
            return null;
        }

        const items = this.getAvailableParts();

        return <div className={`modal ${this.getIsActive()}`}>
            <div className="modal-background" onClick={() => this.onClose()}></div>
            <div className="modal-content">
                <div className="card modal-card">
                    <div className="item-modal-list">
                        {items}
                    </div>

                    <footer className="modal-card-foot">
                        <button className="button" onClick={() => this.onClose()}>Close</button>
                    </footer>
                </div>
            </div>
            <button className="modal-close is-large" onClick={() => this.onClose()}></button>
        </div>;
    }
}

WeaponPartSelectModal.propTypes = {
    isOpen: PropTypes.bool,
    onClosed: PropTypes.func,
    data: PropTypes.object,
    onSelected: PropTypes.func,
    itemData: PropTypes.object
};
