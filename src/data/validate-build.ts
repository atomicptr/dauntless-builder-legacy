import {BuildFlags, BuildModel} from "@src/data/BuildModel";
import {validateSubslotsEmpty} from "@src/data/validators/validate-subslots-empty";
import {validateDoItemsEvenExist} from "@src/data/validators/validate-do-items-even-exist";
import {validateDoCellSlotsFitInTheirSlots} from "@src/data/validators/validate-do-cell-slots-fit-in-their-slots";

type ValidatorFunc = (build: BuildModel, markBuildInvalidOnFailure: boolean) => BuildModel;

const validators: ValidatorFunc[] = [
    validateDoItemsEvenExist,
    validateSubslotsEmpty,
    validateDoCellSlotsFitInTheirSlots,
];

export const validateBuild = (build: BuildModel, markBuildInvalidOnFailure: boolean = false): BuildModel => {
    for (const validatorFunc of validators) {
        build = validatorFunc(build, markBuildInvalidOnFailure);
    }
    return build;
}

export const markBuildInvalid = (build: BuildModel): BuildModel => {
    build.removeFlag(BuildFlags.UpgradedBuild);
    build.addFlag(BuildFlags.InvalidBuild);
    return build;
}
