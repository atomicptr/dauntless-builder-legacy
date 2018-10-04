import React from "react";
import PropTypes from "prop-types";
import ItemUtility from "../utility/ItemUtility";

export default class RepeaterPart extends React.Component {

    onClicked() {
        if(this.props.onClicked) {
            this.props.onClicked(this.props.part, this.props.partType);
        }
    }

    render() {
        const part = this.props.part;
        const partType = this.props.partType;
        const level = this.props.level ? this.props.level : Math.max(...Object.keys(part.power).map(k => Number(k)));

        const capitalize = string => string.charAt(0).toUpperCase() + string.slice(1);

        const powerLevel = part.power[level];

        let elemental = null;

        if(part.elemental) {
            elemental = <span className="elementals">
                <span className="elemental elemental-strength">
                    +&nbsp;<img src={"/assets/icons/elements/" + part.elemental + ".png"} />
                    <span className="only-desktop">&nbsp;{part.elemental}</span>
                </span>
            </span>;
        }

        let title = null;

        if(!this.props.hideTitle) {
            title = <h2 className="subtitle hidden-on-large-screens">{capitalize(partType)}</h2>;
        }

        return <div className="item-title-wrapper">
            {title}
            <div className="item-wrapper">
                <div className="item repeater-part no-cells" onClick={() => this.onClicked()}>
                    <div className="repeater-image-wrapper">
                        <img src={part.icon} />
                    </div>
                    <div className="item-data">
                        <h3 className="item-title">{part.name} {ItemUtility.levelString(level)}</h3>
                        <div className="stat-data">
                            <strong>Power</strong>: {powerLevel} {elemental}
                        </div>
                        {part.part_effect.map(e => <div key={e} className="unique-effects">{e}</div>)}
                    </div>
                </div>
            </div>
        </div>;
    }
}

RepeaterPart.propTypes = {
    part: PropTypes.object,
    partType: PropTypes.string,
    onClicked: PropTypes.func,
    hideTitle: PropTypes.bool,
    level: PropTypes.number
};
