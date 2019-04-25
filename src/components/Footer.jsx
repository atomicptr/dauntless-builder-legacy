import React from "react";

import {Link} from "react-router-dom";

import DataUtility from "../utility/DataUtility";

export default class Footer extends React.Component {
    render() {
        const misc = DataUtility.data().misc;
        const meta = DataUtility.meta();
        const buildTime = new Date(meta.build_time);

        return <div className="footers">
            <span className="footer-link">
                <a
                    href={`https://playdauntless.com/patch-notes/${misc.patchnotes_version_string}`}
                    target="_blank" rel="noopener noreferrer"
                    title={`Last website build: ${buildTime.toDateString()} ${buildTime.toTimeString()}`}>
                        Dauntless <b>{misc.dauntless_version}</b>
                </a>
            </span>
            <span className="footer-link">
                <a href="https://github.com/atomicptr/dauntless-builder" target="_blank" rel="noopener noreferrer">
                    <span className="icon"><i className="fab fa-github"></i></span>Github
                </a>
            </span>
            <span className="footer-link">
                <a href="https://github.com/atomicptr/dauntless-builder/issues" target="_blank" rel="noopener noreferrer">
                    <span className="icon"><i className="fas fa-comment"></i></span>Feedback
                </a>
            </span>
            <span className="footer-link">
                <Link to="/privacy">
                    <span className="icon"><i className="far fa-eye"></i></span>Privacy
                </Link>
            </span>
        </div>;
    }
}