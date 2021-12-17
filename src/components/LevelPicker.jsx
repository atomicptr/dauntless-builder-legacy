import React from "react";
import PropTypes from "prop-types";

export default class LevelPicker extends React.Component {

    constructor(props, context) {
        super(props, context);

        this.state = {
            currentLevel: this.props.level,
            checked: this.props.level === 1,
        };
    }

    onValueChanged() {
        const value = this.state.currentLevel === 1 ? 0 : 1;
        this.setState({currentLevel: value});

        if (this.props.onValueChanged) {
            this.props.onValueChanged(value);
        }
    }

    renderContent() {
        const isSurged = this.state.currentLevel === 1;

        if (!isSurged) {
            return <React.Fragment>
                <i className="far fa-star"/>
                &nbsp;
                <span>Make item &quot;Power surged&quot;</span>
            </React.Fragment>;
        }

        return <React.Fragment>
            <i className="fas fa-star"/>
            &nbsp;
            <span>Power surged</span>
        </React.Fragment>;
    }

    render() {
        return <div className="level-picker only-desktop">
            <button className="button" onClick={this.onValueChanged.bind(this)}>
                {this.renderContent()}
            </button>
        </div>;
    }
}

LevelPicker.propTypes = {
    level: PropTypes.number,
    onValueChanged: PropTypes.func
};
