import BuildModel from "../../models/BuildModel";
import {markBuildInvalid} from "../build-validator";

const validateCellsFitInTheirSlots = (buildModel) => {
    const testSlot = (buildModel, slot, fieldName) => {
        if (!slot || buildModel[fieldName] === "") {
            return buildModel;
        }

        if (!BuildModel.doesCellFitInSlot(slot, buildModel[fieldName])) {
            buildModel[fieldName] = "";
            return markBuildInvalid(buildModel);
        }

        return buildModel;
    };

    if (buildModel.weapon) {
        buildModel = testSlot(buildModel, buildModel.weapon.cells[0], "weapon_cell0");
        buildModel = testSlot(buildModel, buildModel.weapon.cells[1], "weapon_cell1");
    }

    if (buildModel.armour.head) {
        buildModel = testSlot(buildModel, buildModel.armour.head.cells, "head_cell");
    }

    if (buildModel.armour.torso) {
        buildModel = testSlot(buildModel, buildModel.armour.torso.cells, "torso_cell");
    }

    if (buildModel.armour.arms) {
        buildModel = testSlot(buildModel, buildModel.armour.arms.cells, "arms_cell");
    }

    if (buildModel.armour.legs) {
        buildModel = testSlot(buildModel, buildModel.armour.legs.cells, "legs_cell");
    }

    if (buildModel.lantern) {
        buildModel = testSlot(buildModel, buildModel.lantern.cells, "lantern_cell");
    }

    return buildModel;
};

export default validateCellsFitInTheirSlots;
