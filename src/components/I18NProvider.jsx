import React from "react";
import PropTypes from "prop-types";
import { IntlProvider } from "react-intl";
import SettingsUtility from "../utility/SettingsUtility";

import * as messages from "../../i18n";

const toLanguageString = (language) => language.split(/[-_]/)[0];

export const availableLanguages = () => Object.keys(messages);

export const languageDescriptions = () => Object.entries(messages).map(([key, val]) => ({value: key, label: val.name}));

export function detectLanguage() {
    const languages = [...navigator.languages];
    const avail = availableLanguages();
    while (languages.length) {
        let language = toLanguageString(languages.shift());
        if (avail.includes(language)) {
            return language;
        }
    }
    return "en"; // Default language
}

export class I18NProvider extends React.PureComponent {
    render() {
        const language = SettingsUtility.getLanguage();
        const { children } = this.props;

        return (
            <IntlProvider locale={language} messages={messages[language]}>
                {children}
            </IntlProvider>
        );
    }
}

I18NProvider.propTypes = {
    children: PropTypes.element.isRequired
};
