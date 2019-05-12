import React from "react";
import PropTypes from "prop-types";
import PropTypeUtility from "../utility/PropTypeUtility";

import LazyLoad from "react-lazy-load";

export default class ItemIcon extends React.Component {

    constructor(props, context) {
        super(props, context);

        this.state = {
            src: this.props.item.icon || this.getDefaultIcon(),
            triedDefaultIcon: false,
            errorPersistsAfterDefault: false
        };
    }

    componentDidUpdate(prevProps) {
        let icon = prevProps.item.icon || this.getDefaultIcon();

        if(icon !== this.state.src) {
            this.setState({src: icon, triedDefaultIcon: false, errorPersistsAfterDefault: false});
        }
    }

    getDefaultIcon() {
        let type = this.props.item.type;

        if(!type) {
            type = this.props.defaultType;
        }

        return "/assets/icons/general/" + type + ".png";
    }

    onFailedToLoadImage() {
        if(!this.state.triedDefaultIcon) {
            this.setState({src: this.getDefaultIcon(), triedDefaultIcon: true});
            console.log("Icon for", this.props.item ? this.props.item.name : "???",
                "couldn't be found, using this instead:", this.getDefaultIcon());
        } else {
            this.setState({errorPersistsAfterDefault: true});
            console.error("Icon for item couldn't be loaded.", this.props.item);
        }
    }

    render() {
        if(this.state.errorPersistsAfterDefault) {
            return <i className="fas fa-question" style={{
                height: "64px",
                width: "64px",
                fontSize: "48px",
                textAlign: "center"
            }}></i>;
        }

        return <LazyLoad className="image-icon-wrapper" width="64" height="64" offsetVertical="500">
            <img src={this.state.src} onError={this.onFailedToLoadImage.bind(this)} />
        </LazyLoad>;
    }
}

ItemIcon.propTypes = {
    defaultType: PropTypes.string,
    item: PropTypeUtility.item()
};