import React from "react";
import ItemIcon from "./ItemIcon";
import BuildModel from "../models/BuildModel";
import LazyLoad from "react-lazy-load";
import PropTypes from "prop-types";

const Omnicell = ({onItemClicked, selected}) => {
    const item = BuildModel.findOmnicell(selected);

    if (!item) {
        return <div className="item-title-wrapper">
            <div className="item-wrapper">
                <div className="item no-item" onClick={onItemClicked}>
                    <i className="fas fa-question no-item-icon"></i>
                    <div className="item-data">
                        <h3 className="subtitle">No <strong>Omnicell</strong> selected.</h3>
                        <div>Click here to select one.</div>
                    </div>
                </div>
            </div>
        </div>;
    }

    return <div className="item-title-wrapper">
        <h2 className="subtitle hidden-on-large-screens">Omnicell</h2>
        <div className="item-wrapper">
            <div className={"item no-cells"} onClick={onItemClicked}>
                <ItemIcon item={item}/>
                <div className="item-data">
                    <h3 className="item-title">{item.name}</h3>
                    <div><strong>Passive</strong>: {item.passive}</div>
                </div>
            </div>
        </div>
        <div className="item-title-wrapper">
            <div className="item-wrapper unset-height">
                <div className="item part-unique-effect no-cells">
                    {item.ability_icon ?
                        (<LazyLoad className="image-icon-wrapper" width={100} height={100} offsetVertical={500}>
                            <img src={item.ability_icon}/>
                        </LazyLoad>) : null}
                    <div className="item-data">
                        <strong>{item.name + " Active Ability"}</strong>: <br/>
                        {item.active}
                    </div>
                </div>
            </div>
        </div>
    </div>;
};

Omnicell.propTypes = {
    onItemClicked: PropTypes.func,
    selected: PropTypes.bool,
};

export default Omnicell;
