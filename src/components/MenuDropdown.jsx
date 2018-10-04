import React from "react";
import PropTypes from "prop-types";

export default class MenuDropdown extends React.Component {
    constructor(props, context) {
        super(props, context);

        this.state = {
            open: false
        };
    }

    onDropdownClicked() {
        this.setState({open: !this.state.open});
    }

    render() {
        return <div className={"dropdown is-right " + (this.state.open ? "is-active" : "")}>
            <div className="dropdown-trigger">
                <button className="button is-light" onClick={() => this.onDropdownClicked()}>
                    {this.props.label}
                </button>
            </div>
            <div className="dropdown-menu">
                <div className="dropdown-content">
                    {this.props.children}
                </div>
            </div>
        </div>;
    }
}

MenuDropdown.propTypes = {
    label: PropTypes.element,
    children: PropTypes.array
};
