import React from "react";
import DebugButtonComponent from "./DebugButtonComponent";

export default class DebugComponent extends React.Component {
    constructor(props, context) {
        super(props, context);

        this.state = {
            active: this.props.active
        }
    }

    filteredData() {
        // don't filter arrays
        if(Array.isArray(this.props.data)) {
            return this.props.data;
        }

        let ignores = this.props.ignore || [];

        let newData = {};

        for(let key in this.props.data) {
            if(ignores.indexOf(key) === -1) {
                newData[key] = this.props.data[key];
            }
        }

        return newData;
    }

    render() {
        if(!window.isDeveloperModeEnabled()) {
            return null;
        }

        let debugComponent = <DebugButtonComponent onClick={() => this.setState({active: true})}>
            <i className="fas fa-bug"></i>&nbsp;Show debug data
        </DebugButtonComponent>;

        if(this.state.active) {
            debugComponent = <pre className="debug">
                <code>{JSON.stringify(this.filteredData(), null, "    ")}</code>
            </pre>
        }

        return debugComponent;
    }
}