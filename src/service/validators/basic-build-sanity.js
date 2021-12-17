const validateBasicBuildSanity = (buildModel) => {
    if (buildModel.weapon_name === "") {
        buildModel.weapon_level = 0;
        buildModel.weapon_cell0 = "";
        buildModel.weapon_cell1 = "";
        buildModel.weapon_part1_name = "";
        buildModel.weapon_part2_name = "";
        buildModel.weapon_part3_name = "";
        buildModel.bond_weapon_name = "";
    }

    if (buildModel.head_name === "") {
        buildModel.head_level = 0;
        buildModel.head_cell = "";
    }

    if (buildModel.torso_name === "") {
        buildModel.torso_level = 0;
        buildModel.torso_cell = "";
    }

    if (buildModel.arms_name === "") {
        buildModel.arms_level = 0;
        buildModel.arms_cell = "";
    }

    if (buildModel.legs_name === "") {
        buildModel.legs_level = 0;
        buildModel.legs_cell = "";
    }

    if (buildModel.lantern_name === "") {
        buildModel.lantern_cell = "";
    }

    return buildModel;
};

export default validateBasicBuildSanity;
