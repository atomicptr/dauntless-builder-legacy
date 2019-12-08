import React from "react";
import { FormattedHTMLMessage } from "react-intl";
import SettingsUtility from "../utility/SettingsUtility";

export default class DarkModeToggle extends React.Component {

    setTheme(themeName) {
        SettingsUtility.set("theme", themeName);
        window.location.reload();
    }

    render() {
        const primaryContainer = document.querySelector(".primary-container");
        const hasUserPickedTheme = primaryContainer.classList.contains("is-darkmode") ||
            primaryContainer.classList.contains("is-lightmode");

        if (!hasUserPickedTheme) {
            // try to determine which style is active by reading styles
            const styles = window.getComputedStyle(document.querySelector(".card"));

            if (styles["background-color"] === "rgb(255, 255, 255)") {
                SettingsUtility.set("theme", "light");
            } else {
                SettingsUtility.set("theme", "dark");
            }
        }

        const isDarkMode = SettingsUtility.getTheme() === "dark";

        if(isDarkMode) {
            return <a className="dropdown-item" onClick={() => this.setTheme("light")} title="Dark Mode">
                <i className="fas fa-sun"></i> <FormattedHTMLMessage id="ui.enableLightMode"/>
            </a>;
        }

        return <a className="dropdown-item" onClick={() => this.setTheme("dark")} title="Dark Mode">
            <i className="fas fa-moon"></i> <FormattedHTMLMessage id="ui.enableDarkMode"/>
        </a>;
    }
}
