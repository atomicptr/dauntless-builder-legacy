import React from "react";
import PropTypes from "prop-types";
import { FormattedMessage } from "react-intl";
import Case from "case";
import BuildModel from "../models/BuildModel";
import ItemUtility from "../utility/ItemUtility";

export default class PerkString extends React.Component {

    render() {
        const perkList = this.props.perks.map((perk, index) => (
            <span key={perk.name} className="perk-string-items">
                +{perk.value} <img src={"/assets/icons/perks/" + Case.pascal(BuildModel.findPerkByName(perk.name).type) + ".png"} />
                {" "}
                <FormattedMessage id={ItemUtility.getTr("perks", perk.name, "name")} />
                {index !== this.props.perks.length - 1 ? ", " : ""}
            </span>
        ));

        if(perkList.length > 0) {
            return <div><FormattedMessage id="builder.stats.perks" tagName="strong" />{perkList}</div>;
        }

        return null;
    }
}

PerkString.propTypes = {
    perks: PropTypes.array
};
