import React from "react";

export default class PrivacyRoute extends React.Component {

    getOptoutLink() {
        return "https://tools.google.com/dlpage/gaoptout";
    }

    render() {
        return <React.Fragment>
            <h2 className="title">Privacy</h2>

            <p>
                This site uses <a href="https://marketingplatform.google.com/about/analytics/" target="_blank" rel="noopener noreferrer">Google Analytics</a> to
                analyze traffic and help us to improve your user experience.
            </p>

            <h3 style={{marginTop: "1.5rem"}} className="subtitle">What we collect</h3>

            <ul>
                <li>
                    <strong>Usage data</strong> - when you visit our site, we will store which parts of our site you
                    visit, your <strong>anonymized</strong> IP address, information from the device you&#39;re using
                    (operating system, browser, screen resolution, language, country you&#39;re located in) and&nbsp;
                    <a href="https://support.google.com/analytics/answer/6004245" target="_blank" rel="noopener noreferrer">more</a>.
                    We process this data for statistical purposes, to improve our site.
                </li>
            </ul>

            <h3 style={{marginTop: "1.5rem"}} className="subtitle">Opt-out of Google Analytics</h3>

            <p>
                You can opt out of being tracked by our Google Analytics via this&nbsp;
                <a href={this.getOptoutLink()} target="_blank" rel="noopener noreferrer">link</a>.
            </p>
        </React.Fragment>;
    }
}
