import React from "react";
import PropTypes from "prop-types";
import ItemUtility from "../utility/ItemUtility";
import { FormattedMessage } from "react-intl";

export default class RepeaterPart extends React.Component {

    onClicked() {
        if(this.props.onClicked) {
            this.props.onClicked(this.props.part, this.props.partType);
        }
    }

    render() {
        const part = this.props.part;
        const level = this.props.level ? this.props.level : Math.max(...Object.keys(part.power).map(k => Number(k)));

        const powerLevel = part.power[level];

        let elemental = null;

        if(part.elemental) {
            elemental = <span className="elementals">
                <span className="elemental elemental-strength">
                    +&nbsp;<img src={"/assets/icons/elements/" + part.elemental + ".png"} />
                    <span className="only-desktop">&nbsp;<FormattedMessage id={`builder.element.${part.elemental.toLowerCase()}`} /></span>
                </span>
            </span>;
        }

        const partType = this.props.partType;

        return <div className="item-title-wrapper">
            <div className="item-wrapper">
                <div className="item repeater-part no-cells" onClick={() => this.onClicked()}>
                    <div className="repeater-image-wrapper">
                        <img src={part.icon} />
                    </div>
                    <div className="item-data">
                        <h3 className="item-title"><FormattedMessage id={ItemUtility.getTr("parts", "repeater", partType, part.name, "name")} /> {ItemUtility.levelString(level)}</h3>
                        <div className="stat-data">
                            <FormattedMessage id="builder.stats.power" tagName="strong" />{powerLevel} {elemental}
                        </div>
                        {Array.of(...part.part_effects).map(e => (
                            <div key={e} className="unique-effects">
                                <FormattedMessage id={ItemUtility.getTr("parts", "repeater", partType, part.name, "partEffect", e)} />
                            </div>
                        ))}
                        {/* {part.part_effect.map(e => <div key={e} className="unique-effects">{e}</div>)} */}
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
