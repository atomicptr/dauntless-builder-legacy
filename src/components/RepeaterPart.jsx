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
        const level = this.props.level ? this.props.level : Math.max(...Object.keys(part.power).map(k => Number(k)));

        const powerLevel = part.power ? part.power[level] : null;

        let elemental = null;

        if(part.elemental) {
            elemental = <span className="elementals">
                <span className="elemental elemental-strength">
                    +&nbsp;<img src={"/assets/icons/elements/" + part.elemental + ".png"} />
                    <span className="only-desktop">&nbsp;{part.elemental}</span>
                </span>
            </span>;
        }

        return <div className="item-title-wrapper">
            <div className="item-wrapper">
                <div className="item repeater-part no-cells" onClick={() => this.onClicked()}>
                    <div className="repeater-image-wrapper">
                        <img src={part.icon} />
                    </div>
                    <div className="item-data">
                        <h3 className="item-title">{part.name} {part.power ? ItemUtility.levelString(level) : null}</h3>
                        {powerLevel ?
                            <div className="stat-data">
                                <strong>Power</strong>: {powerLevel} {elemental}
                            </div> : null}
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
    level: PropTypes.number
};
