import {BuildFlags} from "../models/BuildModel";

import validateBasicBuildSanity from "./validators/basic-build-sanity";
import validateCellsFitInTheirSlots from "./validators/cells-fit-in-their-slots";

const validators = [
    validateBasicBuildSanity,
    validateCellsFitInTheirSlots,
];

export const validateBuild = (buildModel) => {
    for (const validator of validators) {
        buildModel = validator(buildModel);

        if (!buildModel) {
            throw Error("Build validator did not return build!");
        }
    }

    return buildModel;
};

export const markBuildInvalid = (buildModel) => {
    buildModel.removeFlag(BuildFlags.UPGRADED_BUILD);
    buildModel.addFlag(BuildFlags.INVALID_BUILD);
    return buildModel;
};
