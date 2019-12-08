import React from "react";
import PropTypes from "prop-types";
import ItemUtility from "../utility/ItemUtility";
import { FormattedHTMLMessage, FormattedMessage } from "react-intl";

export default class WeaponPart extends React.Component {

    onClicked() {
        if(this.props.onClicked) {
            this.props.onClicked(this.props.part);
        }
    }

    render() {
        const {part, partType, weaponType, title} = this.props;

        if (!part) {
            return <div className="item-title-wrapper">
                <div className="item-wrapper">
                    <div className="item no-item" onClick={() => this.onClicked()}>
                        <i className="fas fa-question no-item-icon"></i>
                        <div className="item-data">
                            <h3 className="subtitle">
                                <FormattedHTMLMessage id="builder.noItemSelected" values={{title: title}} />
                            </h3>
                            <div><FormattedMessage id="builder.clickToSelect" /></div>
                        </div>
                    </div>
                </div>
            </div>;
        }

        return <div className="item-title-wrapper">
            <div className="item-wrapper">
                <div className="item weapon-part no-cells" onClick={() => this.onClicked()}>
                    <div className="weapon-part-image-wrapper">
                        <img src={part.icon} />
                    </div>
                    <div className="item-data">
                        <h3 className="item-title"><FormattedMessage id={ItemUtility.getTr("parts", weaponType.toLowerCase(), partType, part.name, "name")} /></h3>
                        {Array.of(...part.part_effects).map(e => (
                            <div key={e} className="unique-effects">
                                <FormattedMessage id={ItemUtility.getTr("parts", weaponType.toLowerCase(), partType, part.name, "partEffect", e)} />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>;
    }
}

WeaponPart.propTypes = {
    weaponType: PropTypes.string,
    partType: PropTypes.string,
    title: PropTypes.string,
    part: PropTypes.object,
    onClicked: PropTypes.func
};
