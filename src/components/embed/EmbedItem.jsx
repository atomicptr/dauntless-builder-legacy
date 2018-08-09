import React from "react";
import PropTypes from "prop-types";

import DataUtil from "../../utils/DataUtil";
import MiscUtils from "../../utils/MiscUtils";

import ReactTooltip from "react-tooltip";

import md5 from "md5";
import BuildModel from "../../models/BuildModel";

export default class EmbedItem extends React.Component {
    constructor(props, context) {
        super(props, context);
    }

    renderItem(itemName, type) {
        if(!(itemName in DataUtil.data()[type])) {
            return <span className="dauntless-builder-error">
                Dauntless Builder: Unknown {type} {`"${itemName}"`}
            </span>;
        }

        let item = DataUtil.data()[type][itemName];

        let iconUrl = `https://www.dauntless-builder.com${item.icon}`;

        if(type === "lanterns") {
            iconUrl = "https://www.dauntless-builder.com/assets/icons/general/Lantern.png";
        }

        const id = md5("tp_" + itemName + (++EmbedItem._IDCOUNTER));

        return <span className="dauntless-builder-item-embed" data-tip data-for={id}>
            <img src={iconUrl} className={"icon-" + type} />
            <span className="dauntless-builder-item-embed-text">{itemName}</span>

            {this.renderTooltip(id, item, type)}
        </span>;
    }

    renderTooltip(id, item, type, level = null, isSolid = true) {
        let itemName = item.name;
        let subline = null;
        let extras = null;

        let iconUrl = `https://www.dauntless-builder.com${item.icon}`;

        if(type === "weapons") {
            let powerLow = item.power[0];
            let powerMax = item.power[MiscUtils.maxLevel("weapons", itemName)];

            subline = <div><b>Power</b>: {powerLow} - {powerMax}</div>;

            if(level !== null) {
                subline = <div><b>Power</b>: {item.power[level]}</div>;
            }

            extras = <div>{item.description}</div>;
        } else if(type === "armours") {
            let resistanceLow = item.resistance[0];
            let resistanceMax = item.resistance[MiscUtils.maxLevel("armours", itemName)];

            subline = <div><b>Resistance</b>: {resistanceLow} - {resistanceMax}</div>;

            if(level !== null) {
                subline = <div><b>Power</b>: {item.resistance[level]}</div>;
            }

            extras = <div>{item.description}</div>;
        } else if(type === "lanterns") {
            iconUrl = "https://www.dauntless-builder.com/assets/icons/general/Lantern.png";

            extras = <div>
                {item.lantern_ability.instant ? <div><b>Instant</b>: {item.lantern_ability.instant}</div> : null}
                {item.lantern_ability.hold ? <div><b>Hold</b>: {item.lantern_ability.hold}</div> : null}
            </div>;
        }

        return <ReactTooltip id={id} place="bottom" type="light" effect={isSolid ? "solid" : null} delayHide={isSolid ? 100 : 0} className="dauntless-builder-tooltip">
            <div className="dauntless-builder-tooltip-titleline">
                <img src={iconUrl} className={"icon-" + type} />
                <div className="dauntless-builder-tooltip-titleline-stats">
                    <h2>{itemName} {(level ? (level > 0 ? `+ ${level}` : "") : "")}</h2>
                    {subline}
                </div>
            </div>

            {extras}

            <div className="dauntless-builder-wikilink">
                {isSolid ? this.renderWikiLink(itemName) : null}
            </div>
        </ReactTooltip>;
    }

    renderWikiLink(itemName) {
        return <a href={"https://dauntless.gamepedia.com/" + (itemName.replace(" ", "_"))} target="_blank" rel="noopener noreferrer">
            Wiki
        </a>;
    }

    renderBuild(buildId) {
        let match = new RegExp(/^https:\/\/(?:www\.)?dauntless-builder\.com\/b\/(.*)/g).exec(buildId);

        if(match) {
            buildId = match[1];
        }

        let build = BuildModel.deserialize(buildId);

        let items = [];

        const weapon = build.weapon;
        const head = build.armour.head;
        const torso = build.armour.torso;
        const arms = build.armour.arms;
        const legs = build.armour.legs;
        const lantern = build.lantern;

        let insertItem = (item, type, cells = [], level = null) => {
            const id = md5("build_" + item.name + (++EmbedItem._IDCOUNTER));

            let icon = `https://www.dauntless-builder.com${item.icon}`;

            if(type === "lanterns") {
                icon = "https://www.dauntless-builder.com/assets/icons/general/Lantern.png";
            }

            if(type !== "weapons") {
                cells = [cells];
            }

            let cellItems = cells.map(cell => {
                if(!cell[1]) {
                    return null;
                }

                return <div key={md5(cell[0] + "_" + (++EmbedItem._IDCOUNTER))} className={"cell " + cell[1].variants[cell[0]].rarity}>
                    <img src={`https://www.dauntless-builder.com/assets/icons/perks/${cell[1].slot}.png`} />
                    <span>{cell[0]}</span>
                </div>;
            });

            items.push(
                <div key={id} data-tip data-for={id} className="item">
                    <h2>
                        <img src={icon} />
                        <span>{item.name} {level > 0 ? `+ ${level}` : ""}</span>
                    </h2>

                    <div className="cells">
                        {cellItems}
                    </div>

                    {this.renderTooltip(id, item, type, level, false)}
                </div>
            );
        };

        if(weapon) {
            insertItem(weapon, "weapons", build.weaponCells, build.weapon_level);
        }

        if(head) {
            insertItem(head, "armours", build.armourCells.head, build.head_level);
        }

        if(torso) {
            insertItem(torso, "armours", build.armourCells.torso, build.torso_level);
        }

        if(arms) {
            insertItem(arms, "armours", build.armourCells.arms, build.arms_level);
        }

        if(legs) {
            insertItem(legs, "armours", build.armourCells.legs, build.legs_level);
        }

        if(lantern) {
            insertItem(lantern, "lanterns", [
                build.lantern_cell,
                BuildModel.findCellByVariantName(build.lantern_cell)
            ]);
        }

        return <div className="dauntless-builder-build">
            <a href={`https://www.dauntless-builder.com/b/${buildId}`} target="_blank"
                rel="noopener noreferrer"
                className="dauntless-builder-build-header">

                <img src="https://www.dauntless-builder.com/assets/icon.png" />
                Dauntless-Builder.com
            </a>

            {items}
        </div>;
    }

    render() {
        switch(this.props.type) {
            case "weapon": return this.renderItem(this.props.value, "weapons");
            case "armour": return this.renderItem(this.props.value, "armours");
            case "lantern": return this.renderItem(this.props.value, "lanterns");
            case "build": return this.renderBuild(this.props.value);
        }

        return <span className="dauntless-builder-error">Dauntless Builder: Unknown Embed Type: {`"${this.props.type}"`}</span>;
    }
}

EmbedItem.propTypes = {
    type: PropTypes.string,
    value: PropTypes.string
};

EmbedItem._IDCOUNTER = 0;