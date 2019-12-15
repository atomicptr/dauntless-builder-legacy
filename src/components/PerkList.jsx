import React from "react";
import PropTypes from "prop-types";
import ItemUtility from "../utility/ItemUtility";

import ReactTooltip from "react-tooltip";
import Case from "case";

import BuildModel from "../models/BuildModel";
import { injectIntl, FormattedMessage } from "react-intl";

class PerkList extends React.Component {
    tr(id, ...args) {return this.props.intl.formatMessage({id}, ...args);}

    getPerkLevelClass(perkValue) {
        if(perkValue >= 1 && perkValue < 6) {
            return "perk-ok perk-level-" + perkValue;
        }

        if(perkValue == 6) {
            return "perk-max";
        }

        return "perk-overload";
    }

    renderPerkEffect(perkName, perkValue) {
        let perk = BuildModel.findPerkByName(perkName);

        if(!perk) {
            return null;
        }

        let effectCount = Array.isArray(perk.key) ? perk.key.length : 1;

        const effectLvl = Math.max(0, Math.min(6, perkValue));
        // let effect = perk.effects[effectLvl];

        let elems = [];

        for(let i = 0; i < effectCount; i++) {
            elems.push(
                <div className="perk-effect" key={"perk-effect-" + i}>
                    {this.tr(ItemUtility.getTr("perks", perkName, "effects", effectLvl, i))}
                </div>
            );
        }

        return <React.Fragment>
            {elems}
        </React.Fragment>;
    }

    renderPerkTooltipData(perkName, perkValue) {
        let perk = BuildModel.findPerkByName(perkName);
        let effectCount = Array.isArray(perk.key) ? perk.key.length : 1;

        let elems = Object.keys(perk.effects).map(effectKey => {
            let counter = 0;

            let value = Math.max(0, Math.min(6, perkValue));

            const elems = [];

            for(let i = 0; i < effectCount; i++) {
                elems.push(
                    <span key={"desc" + (counter++)}>
                        {this.tr(ItemUtility.getTr("perks", perkName, "effects", effectKey, i))}
                    </span>
                );
            }

            return <div key={effectKey} className={"tp-effect " + (Number(value) === Number(effectKey) ? "active" : "")}>
                {elems}
            </div>;
        });

        return elems;
    }

    render() {
        let perks = this.props.perks.map(perk =>
            <React.Fragment key={perk.name}>
                <li className={this.getPerkLevelClass(perk.value)} data-tip data-for={"PerkTooltip-" + perk.name}>
                    <img className="perk-icon" src={"/assets/icons/perks/" +
                        Case.pascal(BuildModel.findPerkByName(perk.name).type) + ".png"} />
                    <div className="perk-data-wrapper">
                        <div className="perk-title">+{perk.value} <FormattedMessage id={ItemUtility.getTr("perks", perk.name, "name")} /></div>
                        {this.renderPerkEffect(perk.name, perk.value)}
                    </div>
                </li>

                <ReactTooltip id={"PerkTooltip-" + perk.name} place="bottom" type="dark" effect="solid">
                    {this.renderPerkTooltipData(perk.name, perk.value)}
                </ReactTooltip>
            </React.Fragment>
        );

        if(perks.length === 0) {
            perks.push(
                <li key="no-perks-found" className="perk-level-5">
                    <div className="perk-title"><FormattedMessage id="builder.noPerksAvailable" /></div>
                </li>
            );
        }

        return <ul className="perk-list">
            <li className="perk-title-line">
                <FormattedMessage tagName="h2" id="builder.perks" />
            </li>

            {perks}
        </ul>;
    }
}

PerkList.propTypes = {
    perks: PropTypes.array,
    intl: PropTypes.shape({
        formatMessage: PropTypes.func.isRequired
    }).isRequired
};

export default injectIntl(PerkList);