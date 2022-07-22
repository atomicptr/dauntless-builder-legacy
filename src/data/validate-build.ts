import { BuildFlags, BuildModel } from "@src/data/BuildModel";
import { validateBondWeapon } from "@src/data/validators/validate-bond-weapon";
import { validateDoCellSlotsFitInTheirSlots } from "@src/data/validators/validate-do-cell-slots-fit-in-their-slots";
import { validateDoItemsEvenExist } from "@src/data/validators/validate-do-items-even-exist";
import { validateSubslotsEmpty } from "@src/data/validators/validate-subslots-empty";
import { validateWepaonParts } from "@src/data/validators/validate-wepaon-parts";

type ValidatorFunc = (build: BuildModel, markBuildInvalidOnFailure: boolean) => BuildModel;

const validators: ValidatorFunc[] = [
    validateDoItemsEvenExist,
    validateSubslotsEmpty,
    validateDoCellSlotsFitInTheirSlots,
    validateWepaonParts,
    validateBondWeapon,
];

export const validateBuild = (build: BuildModel, markBuildInvalidOnFailure = false): BuildModel => {
    for (const validatorFunc of validators) {
        build = validatorFunc(build, markBuildInvalidOnFailure);
    }
    return build;
};

export const markBuildInvalid = (build: BuildModel): BuildModel => {
    build.removeFlag(BuildFlags.UpgradedBuild);
    build.addFlag(BuildFlags.InvalidBuild);
    return build;
};
