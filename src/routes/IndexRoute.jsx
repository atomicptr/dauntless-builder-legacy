import React from "react";

import {Link} from "react-router-dom";
import { FormattedMessage } from "react-intl";

export default class IndexRoute extends React.Component {
    render() {
        return <div>
            <div className="featured">
                <div className="columns">
                    <div className="column">
                        <Link to="/b/new">
                            <div className="notification is-success new-build-tile feature-tile">
                                <p className="title"><FormattedMessage id="ui.makeANewBuild" /></p>
                                <div className="feature-tile-background">
                                    <i className="fas fa-plus"></i>
                                </div>
                            </div>
                        </Link>
                    </div>
                </div>

                <div className="columns">
                    <div className="column">
                        <Link to="/favorites">
                            <div className="tile notification is-danger feature-tile">
                                <p className="title"><FormattedMessage id="ui.myBuilds" /></p>
                                <div className="feature-tile-background">
                                    <i className="fas fa-folder-open"></i>
                                </div>
                            </div>
                        </Link>
                    </div>

                    <div className="column">
                        <a href="https://github.com/atomicptr/dauntless-builder" target="_blank" rel="noopener noreferrer">
                            <div className="tile notification is-light feature-tile">
                                <p className="title"><FormattedMessage id="ui.sourceCode" /></p>
                                <div className="feature-tile-background">
                                    <i className="fab fa-github"></i>
                                </div>
                            </div>
                        </a>
                    </div>
                </div>

                <div className="columns">
                    <div className="column">
                        <a href="https://reddit.com/r/dauntless" target="_blank" rel="noopener noreferrer">
                            <div className="tile notification is-light feature-tile">
                                <p className="title">/r/dauntless</p>
                                <div className="feature-tile-background">
                                    <i className="fab fa-reddit"></i>
                                </div>
                            </div>
                        </a>
                    </div>

                    <div className="column">
                        <a href="https://discord.gg/dauntless" target="_blank" rel="noopener noreferrer">
                            <div className="tile notification is-light feature-tile">
                                <p className="title">Dauntless Discord</p>
                                <div className="feature-tile-background">
                                    <i className="fab fa-discord"></i>
                                </div>
                            </div>
                        </a>
                    </div>
                </div>

            </div>
        </div>;
    }
}
