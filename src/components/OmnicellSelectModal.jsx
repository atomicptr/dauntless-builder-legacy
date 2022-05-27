import React from "react";
import ItemIcon from "./ItemIcon";
import BuildModel from "../models/BuildModel";
import PropTypes from "prop-types";
import {parseText} from "../utility/TextUtility";

const OmnicellSelectModal = ({itemData, onSelected, onCanceled, isOpen}) => {
    if (!isOpen) {
        return null;
    }

    return <div className={`modal ${isOpen ? "is-active" : ""}`}>
        <div className="modal-background" onClick={onCanceled}></div>
        <div className="modal-content">
            <div className="card modal-card">
                <div className="item-modal-list">
                    {Object.keys(itemData.omnicells).map(name => {
                        const item = BuildModel.findOmnicell(name);

                        return <div key={name} className="item-title-wrapper">
                            <div className="item-wrapper">
                                <div className="item" onClick={() => onSelected(name)}>
                                    <ItemIcon item={item}/>
                                    <div className="item-data">
                                        <h3 className="item-title">{item.name}</h3>
                                        <div><strong>Passive</strong>: {item.passive}</div>
                                        <div><strong>Active</strong>: <span dangerouslySetInnerHTML={{__html: parseText(item.active)}} /></div>
                                    </div>
                                </div>
                            </div>
                        </div>;
                    })}
                </div>

                <footer className="modal-card-foot">
                    <div className="footer-right">
                        <button
                            className="button"
                            onClick={() => onSelected("")}>
                            Select&nbsp;<strong>No Omnicell</strong>.
                        </button>
                        <button className="button" onClick={onCanceled}>Cancel</button>
                    </div>
                </footer>
            </div>
        </div>
        <button className="modal-close is-large" onClick={onCanceled}></button>
    </div>;
};

OmnicellSelectModal.propTypes = {
    isOpen: PropTypes.bool,
    onSelected: PropTypes.func,
    onCanceled: PropTypes.func,
    itemData: PropTypes.shape({
        omnicells: PropTypes.object
    })
};

export default OmnicellSelectModal;
