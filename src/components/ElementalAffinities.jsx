import React from "react";

import ItemUtility from "../utility/ItemUtility";
import PropTypeUtility from "../utility/PropTypeUtility";
import { FormattedMessage } from "react-intl";

export default class ElementalAffinities extends React.Component {

    render() {
        let strength = null;
        let weakness = null;

        const {item} = this.props;

        if(ItemUtility.itemType(item.type) === "weapon" && item.elemental) {
            strength = <span className="elemental elemental-strength">
                +&nbsp;<img src={"/assets/icons/elements/" + item.elemental + ".png"} />
                <span className="only-desktop">&nbsp;<FormattedMessage id={`builder.element.${item.elemental.toLowerCase()}`} /></span>
            </span>;
        }

        if(ItemUtility.itemType(item.type) === "armour") {
            if(item.strength) {
                strength = <span className="elemental elemental-strength">
                    +&nbsp;<img src={"/assets/icons/elements/" + item.strength + ".png"} />
                    <span className="only-desktop">&nbsp;<FormattedMessage id={`builder.element.${item.strength.toLowerCase()}`} /></span>
                </span>;
            }

            if(item.weakness) {
                weakness = <span className="elemental elemental-weakness">
                    -&nbsp;<img src={"/assets/icons/elements/" + item.weakness + ".png"} />
                    <span className="only-desktop">&nbsp;<FormattedMessage id={`builder.element.${item.weakness.toLowerCase()}`} /></span>
                </span>;
            }
        }

        if(!strength && !weakness) {
            return null;
        }

        return <span className="elementals">
            {strength}
            {weakness}
        </span>;
    }
}

ElementalAffinities.propTypes = {
    item: PropTypeUtility.item()
};
