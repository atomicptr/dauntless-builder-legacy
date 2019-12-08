import React from "react";
import Select from "react-select";
import { languageDescriptions } from "./I18NProvider";
import SettingsUtility from "../utility/SettingsUtility";

export default class I18NSelector extends React.PureComponent {

    setLanguage(languageName) {
        SettingsUtility.setLanguage(languageName);
        window.location.reload();
    }

    getLanguage() {
        return SettingsUtility.getLanguage();
    }

    render() {
        const options = languageDescriptions();
        const lang = this.getLanguage();

        if (options.length < 2) {
            return null;
        }

        return (
            <div className="i18n-selector">
                <Select
                    defaultOptions
                    placeholder="Language..."
                    onChange={language => this.setLanguage(language)}
                    value={lang}
                    clearable={false}
                    options={options} />
            </div>
        );
    }
}