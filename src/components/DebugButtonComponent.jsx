import React from "react";

export default class DebugButtonComponent extends React.Component {
    render() {
        if(!window.isDeveloperModeEnabled()) {
            return null;
        }

        return <button className="button is-danger is-debug-button" onClick={() => this.props.onClick()}>
            {this.props.children}
        </button>;
    }
}