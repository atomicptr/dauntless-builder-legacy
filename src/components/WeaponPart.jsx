import React from "react";
import PropTypes from "prop-types";

export default class WeaponPart extends React.Component {

    onClicked() {
        if(this.props.onClicked) {
            this.props.onClicked(this.props.part);
        }
    }

    render() {
        const part = this.props.part;
        const partType = this.props.partType;

        const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);

        if (!part) {
            return <div className="item-title-wrapper">
                <div className="item-wrapper">
                    <div className="item no-item" onClick={() => this.onClicked()}>
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

        return <div className="item-title-wrapper">
            <div className="item-wrapper">
                <div className="item repeater-part no-cells" onClick={() => this.onClicked()}>
                    <div className="repeater-image-wrapper">
                        <img src={part.icon} />
                    </div>
                    <div className="item-data">
                        <h3 className="item-title">{part.name}</h3>
                        {part.part_effect.map(e => <div key={e} className="unique-effects">{e}</div>)}
                    </div>
                </div>
            </div>
        </div>;
    }
}

WeaponPart.propTypes = {
    partType: PropTypes.string,
    part: PropTypes.object,
    onClicked: PropTypes.func
};
