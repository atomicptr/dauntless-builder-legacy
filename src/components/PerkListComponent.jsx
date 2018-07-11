import React from "react";
import ReactTooltip from "react-tooltip";

import "../styles/components/perk-list.scss";

import BuildModel from "../models/BuildModel";

export default class PerkListComponent extends React.Component {
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

        let effect = perk.effects[Math.max(0, Math.min(6, perkValue))];

        let elems = [];

        for(let i = 0; i < effectCount; i++) {
            elems.push(
                <div className="perk-effect" key={"perk-effect-" + i}>
                    {Array.isArray(perk.key) ? effect.description[i] : effect.description}
                </div>
            );
        }

        return <React.Fragment>
            {elems}
        </React.Fragment>
    }

    renderPerkTooltipData(perkName, perkValue) {
        let perk = BuildModel.findPerkByName(perkName);

        let effectCount = Array.isArray(perk.key) ? perk.key.length : 1;

        let elems = Object.keys(perk.effects).map(effectKey => {
            let description = Array.isArray(perk.effects[effectKey].description) ?
                perk.effects[effectKey].description : [perk.effects[effectKey].description];

            let counter = 0;

            let value = Math.max(0, Math.min(6, perkValue));

            return <div key={effectKey} className={"tp-effect " + (Number(value) === Number(effectKey) ? "active" : "")}>
                {description.map(d => <span key={"desc" + (counter++)}>{d}</span>)}
            </div>;
        });

        return elems;
    }

    render() {
        let perks = this.props.perks.map(perk =>
            <React.Fragment key={perk.name}>
                <li className={this.getPerkLevelClass(perk.value)} data-tip data-for={"PerkTooltip-" + perk.name}>
                    <div className="perk-title">+{perk.value} {perk.name}</div>
                    {this.renderPerkEffect(perk.name, perk.value)}
                </li>

                <ReactTooltip id={"PerkTooltip-" + perk.name} place="bottom" type="dark" effect="solid">
                    {this.renderPerkTooltipData(perk.name, perk.value)}
                </ReactTooltip>
            </React.Fragment>
        );

        if(perks.length === 0) {
            perks.push(
                <li key="no-perks-found" className="perk-level-5">
                    <div className="perk-title">No perks available.</div>
                </li>
            );
        }

        return <ul className="perk-list">
            <li className="perk-title-line">
                <h2>Perks</h2>
            </li>

            {perks}
        </ul>;
    }
}