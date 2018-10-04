import React from "react";

import ItemUtility from "../utility/ItemUtility";
import PropTypeUtility from "../utility/PropTypeUtility";

export default class ElementalAffinities extends React.Component {

    render() {
        let strength = null;
        let weakness = null;

        const {item} = this.props;

        if(ItemUtility.itemType(item.type) === "Weapon" && item.elemental) {
            strength = <span className="elemental elemental-strength">
                +&nbsp;<img src={"/assets/icons/elements/" + item.elemental + ".png"} />
                <span className="only-desktop">&nbsp;{item.elemental}</span>
            </span>;
        }

        if(ItemUtility.itemType(item.type) === "Armour") {
            if(item.strength) {
                strength = <span className="elemental elemental-strength">
                    +&nbsp;<img src={"/assets/icons/elements/" + item.strength + ".png"} />
                    <span className="only-desktop">&nbsp;{item.strength}</span>
                </span>;
            }

            if(item.weakness) {
                weakness = <span className="elemental elemental-weakness">
                    -&nbsp;<img src={"/assets/icons/elements/" + item.weakness + ".png"} />
                    <span className="only-desktop">&nbsp;{item.weakness}</span>
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
