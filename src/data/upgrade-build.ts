import { BuildFlags, BuildModel, CURRENT_BUILD_ID } from "@src/data/BuildModel";
import { buildIdsDecode, buildIdsEncode, buildIdsProgressiveDecode, BuildIdsProvider } from "@src/utils/build-id";

interface UpgradeResult {
    buildId: string;
    wasUpgraded: boolean;
}

export const convertVersion2To3 = (version2BuildId: string): UpgradeResult => {
    const numbers = buildIdsDecode(version2BuildId, BuildIdsProvider.HASHIDS);

    /* eslint-disable sort-keys */
    /* eslint-disable sort-keys-fix/sort-keys-fix */
    const data = {
        __version: 3,
        weapon_name: numbers[1],
        weapon_level: numbers[2],
        weapon_cell0: numbers[3],
        weapon_cell1: numbers[4],
        weapon_part1_name: numbers[5],
        weapon_part2_name: numbers[7],
        weapon_part3_name: numbers[9],
        weapon_part4_name: numbers[11],
        bond_weapon_name: numbers[13],
        weapon_part6_name: numbers[15],
        head_name: numbers[17],
        head_level: numbers[18],
        head_cell: numbers[19],
        torso_name: numbers[20],
        torso_level: numbers[21],
        torso_cell: numbers[22],
        arms_name: numbers[23],
        arms_level: numbers[24],
        arms_cell: numbers[25],
        legs_name: numbers[26],
        legs_level: numbers[27],
        legs_cell: numbers[28],
        lantern_name: numbers[29],
        lantern_cell: numbers[30],
    };
    /* eslint-enable sort-keys */
    /* eslint-enable sort-keys-fix/sort-keys-fix */
    return { buildId: buildIdsEncode(Object.values(data), BuildIdsProvider.HASHIDS), wasUpgraded: true };
};

export const convertVersion3To4 = (version3BuildId: string): UpgradeResult => {
    const numbers = buildIdsDecode(version3BuildId, BuildIdsProvider.HASHIDS);

    /* eslint-disable sort-keys */
    /* eslint-disable sort-keys-fix/sort-keys-fix */
    const data = {
        __version: 4,
        weapon_name: numbers[1],
        weapon_level: numbers[2],
        weapon_cell0: numbers[3],
        weapon_cell1: numbers[4],
        weapon_part1_name: numbers[5],
        weapon_part2_name: numbers[6],
        weapon_part3_name: numbers[7],
        weapon_part4_name: numbers[8],
        bond_weapon_name: numbers[9],
        weapon_part6_name: numbers[10],
        head_name: numbers[11],
        head_level: numbers[12],
        head_cell: numbers[13],
        torso_name: numbers[14],
        torso_level: numbers[15],
        torso_cell: numbers[16],
        arms_name: numbers[17],
        arms_level: numbers[18],
        arms_cell: numbers[19],
        legs_name: numbers[20],
        legs_level: numbers[21],
        legs_cell: numbers[22],
        lantern_name: numbers[23],
        lantern_cell: numbers[24],
        omnicell: 0,
    };
    /* eslint-enable sort-keys */
    /* eslint-enable sort-keys-fix/sort-keys-fix */
    return { buildId: buildIdsEncode(Object.values(data), BuildIdsProvider.HASHIDS), wasUpgraded: true };
};

export const convertVersion4To5 = (version4BuildId: string): UpgradeResult => {
    const numbers = buildIdsDecode(version4BuildId, BuildIdsProvider.HASHIDS);

    // if this is a v4 build with 24 numbers its actually an already converted build
    if (numbers.length === 24) {
        return { buildId: version4BuildId, wasUpgraded: false };
    }

    /* eslint-disable sort-keys */
    /* eslint-disable sort-keys-fix/sort-keys-fix */
    const data = {
        __version: 5,
        weapon_name: numbers[1],
        weapon_level: numbers[2],
        weapon_cell0: numbers[3],
        weapon_cell1: numbers[4],
        weapon_part1_name: numbers[5],
        weapon_part2_name: numbers[6],
        weapon_part3_name: numbers[7],
        bond_weapon_name: numbers[9],
        head_name: numbers[11],
        head_level: numbers[12],
        head_cell: numbers[13],
        torso_name: numbers[14],
        torso_level: numbers[15],
        torso_cell: numbers[16],
        arms_name: numbers[17],
        arms_level: numbers[18],
        arms_cell: numbers[19],
        legs_name: numbers[20],
        legs_level: numbers[21],
        legs_cell: numbers[22],
        lantern_name: numbers[23],
        lantern_cell: numbers[24],
        omnicell: numbers[25],
    };
    /* eslint-enable sort-keys */
    /* eslint-enable sort-keys-fix/sort-keys-fix */

    // replace old modular Repeater with Recruits Repeater
    let wasUpgraded = false;
    const modularRepeaterWeaponId = 27;
    if (data.weapon_name === modularRepeaterWeaponId) {
        data.weapon_name = 169; // Recruits Repeater
        data.weapon_level = 0;
        data.weapon_cell0 = 0;
        data.weapon_cell1 = 0;
        data.weapon_part1_name = numbers[6];
        data.weapon_part2_name = numbers[7];
        data.weapon_part3_name = numbers[10];
        wasUpgraded = true;
    }

    return { buildId: buildIdsEncode(Object.values(data), BuildIdsProvider.HASHIDS), wasUpgraded };
};

export const convertVersion5To6 = (version6BuildId: string): UpgradeResult => {
    const numbers = buildIdsDecode(version6BuildId, BuildIdsProvider.HASHIDS);

    /* eslint-disable sort-keys */
    /* eslint-disable sort-keys-fix/sort-keys-fix */
    const data = {
        __version: 6,
        __flags: 0,
        weapon_name: numbers[1],
        weapon_level: numbers[2],
        weapon_cell0: numbers[3],
        weapon_cell1: numbers[4],
        weapon_part1_name: numbers[5],
        weapon_part2_name: numbers[6],
        weapon_part3_name: numbers[7],
        bond_weapon_name: numbers[8],
        head_name: numbers[9],
        head_level: numbers[10],
        head_cell: numbers[11],
        torso_name: numbers[12],
        torso_level: numbers[13],
        torso_cell: numbers[14],
        arms_name: numbers[15],
        arms_level: numbers[16],
        arms_cell: numbers[17],
        legs_name: numbers[18],
        legs_level: numbers[19],
        legs_cell: numbers[20],
        lantern_name: numbers[21],
        lantern_cell: numbers[22],
        omnicell: numbers[23],
    };
    /* eslint-enable sort-keys */
    /* eslint-enable sort-keys-fix/sort-keys-fix */

    return { buildId: buildIdsEncode(Object.values(data), BuildIdsProvider.HASHIDS), wasUpgraded: false };
};

export const convertVersion6To7 = (version6BuildId: string): UpgradeResult => {
    const numbers = buildIdsDecode(version6BuildId, BuildIdsProvider.HASHIDS);
    numbers[0] = 7;
    return { buildId: buildIdsEncode(numbers, BuildIdsProvider.SQIDS_V7), wasUpgraded: false };
};

export const convertVersion7To8 = (version7BuildId: string): UpgradeResult => {
    const numbers = buildIdsDecode(version7BuildId, BuildIdsProvider.SQIDS_V7);
    numbers[0] = 8;
    return { buildId: buildIdsEncode(numbers), wasUpgraded: false };
};

export const upgradeBuild = (buildId: string): string => {
    const buildVersion = () => buildIdsProgressiveDecode(buildId)[0];

    let buildWasUpgraded = false;

    if (buildVersion() === CURRENT_BUILD_ID) {
        return buildId;
    }

    if (buildVersion() === 2) {
        const { buildId: newBuildId, wasUpgraded } = convertVersion2To3(buildId);
        buildId = newBuildId;
        buildWasUpgraded = wasUpgraded;
    }

    if (buildVersion() === 3) {
        const { buildId: newBuildId, wasUpgraded } = convertVersion3To4(buildId);
        buildId = newBuildId;
        buildWasUpgraded = wasUpgraded;
    }

    if (buildVersion() === 4) {
        const { buildId: newBuildId, wasUpgraded } = convertVersion4To5(buildId);
        buildId = newBuildId;
        buildWasUpgraded = wasUpgraded;
    }

    if (buildVersion() === 5) {
        const { buildId: newBuildId, wasUpgraded } = convertVersion5To6(buildId);
        buildId = newBuildId;
        buildWasUpgraded = wasUpgraded;
    }

    if (buildVersion() === 6) {
        const { buildId: newBuildId, wasUpgraded } = convertVersion6To7(buildId);
        buildId = newBuildId;
        buildWasUpgraded = wasUpgraded;
    }

    if (buildVersion() === 7) {
        const { buildId: newBuildId, wasUpgraded } = convertVersion7To8(buildId);
        buildId = newBuildId;
        buildWasUpgraded = wasUpgraded;
    }

    const build = BuildModel.deserialize(buildId);

    if (buildWasUpgraded) {
        build.addFlag(BuildFlags.UpgradedBuild);
    }

    return build.serialize();
};
