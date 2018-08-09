import React from "react";
import PropTypes from "prop-types";

import {CopyToClipboard} from "react-copy-to-clipboard";

export default class BuildEmbeddedModalComponent extends React.Component {
    constructor(props, context) {
        super(props, context);

        this.state = {
            open: !!this.props.isOpen,
        };
    }

    // TODO: refactor this, since componentWillReceiveProps is deprecated
    UNSAFE_componentWillReceiveProps(nextProps) {
        let newState = {};

        if(nextProps.isOpen !== this.state.open) {
            newState.open = nextProps.isOpen;
        }

        if(Object.keys(newState).length > 0) {
            this.setState(newState);
        }
    }

    onClose() {
        this.setState({open: false}, () => {
            if(this.props.onClosed) {
                this.props.onClosed();
            }
        });
    }

    getIsActive() {
        return this.state.open ? "is-active" : "";
    }

    render() {
        if(!this.state.open) {
            return null;
        }

        const embedCode = `<div data-dauntless-build="${this.props.buildId}"></div><script async src="https://www.dauntless-builder.com/dist/embed.js"></script>`;

        return <div className={`modal ${this.getIsActive()}`}>
            <div className="modal-background" onClick={() => this.onClose()}></div>
            <div className="modal-content">
                <div className="card modal-card">
                    <h3 className="subtitle">Embed this build on your website</h3>
                    <textarea className="textarea is-dark" autoFocus={true} readOnly={true}
                        style={{marginBottom: "20px", minHeight: "400px"}}
                        value={embedCode}></textarea>

                    <footer className="modal-card-foot">
                        <CopyToClipboard text={embedCode} refs="copyEmbedButton" onCopy={() => this.onClose()}>
                            <button className="button">
                                <i className="fas fa-copy"></i>&nbsp;Copy
                            </button>
                        </CopyToClipboard>
                        <button className="button" onClick={() => this.onClose()}>Close</button>
                    </footer>
                </div>
            </div>
            <button className="modal-close is-large" onClick={() => this.onClose()}></button>
        </div>;
    }
}

BuildEmbeddedModalComponent.propTypes = {
    buildId: PropTypes.string,
    isOpen: PropTypes.bool,
    onClosed: PropTypes.func
};