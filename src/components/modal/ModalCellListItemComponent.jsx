import React from "react";

export default class ModalCellListItemComponent extends React.Component {
    render() {
        const item = this.props.item;

        let getPerkDescription = perk => {
            if(perk in this.props.itemData.perks) {
                return this.props.itemData.perks[perk].description;
            }

            return null;
        };

        let getDescriptions = variant => {
            return Object.keys(variant.perks).map(perk => getPerkDescription(perk)).join(", ");
        };

        let variants = Object.keys(item.variants).map(v =>
            <div key={v} className={"cell " + item.variants[v].rarity} onClick={() => this.props.onSelected("Cell", v)}>
                <img src={"/assets/icons/perks/" + item.slot + ".png"} />
                <div>
                    <div className="cell-title">{v}</div>
                    <div className="perks">{getDescriptions(item.variants[v])}</div>
                </div>
            </div>
        );

        return <React.Fragment key={item.name}>
            <h3 className="subtitle cell-title-line">{item.name}</h3>
            <div className="cells">
                {variants}
            </div>
        </React.Fragment>
    }
}