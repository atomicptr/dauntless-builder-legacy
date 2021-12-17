import BuildModel, {BuildFlags} from "../models/BuildModel";
import React from "react";
import PropTypes from "prop-types";

const BuildWarning = (props) => {
    if (props.build.hasFlag(BuildFlags.UPGRADED_BUILD)) {
        return <div className="notification is-warning is-light">
            {"This build was made for an earlier version of Dauntless and might be outdated."}
        </div>;
    }

    if (props.build.hasFlag(BuildFlags.INVALID_BUILD)) {
        return <div className="notification is-danger is-light">
            {"This build is broken, several parts have been automatically unequipped since they are no longer " +
            "compatible with the current version of Dauntless."}
        </div>;
    }

    return null;
};

BuildWarning.propTypes = {
    build: PropTypes.objectOf(BuildModel),
};

export default BuildWarning;
