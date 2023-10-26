import { BuildModel, CURRENT_BUILD_ID } from "@src/data/BuildModel";
import { convertVersion3To4, upgradeBuild } from "@src/data/upgrade-build";
import { buildIdsDecode, buildIdsProgressiveDecode, BuildIdsProvider } from "@src/utils/build-id";

describe("upgrading builds", () => {
    // TODO: get builds for the missing versions and some edge cases
    const v3BuildId = "dbU0wFWC74i85CqFxCyTwTBTkTApHaC6VfeFbCgFjQhoCjmc1tpCmNcWCjkIv";

    it("should update build from v3 to v4", () => {
        const { buildId } = convertVersion3To4(v3BuildId);
        const data = buildIdsDecode(buildId, BuildIdsProvider.HASHIDS);
        expect(BuildModel.isValid(v3BuildId)).toBeTruthy();
        expect(data[0]).toBe(4);
    });

    it("should upgrade a build to current version", () => {
        const upgradedBuildId = upgradeBuild(v3BuildId);
        expect(BuildModel.isValid(upgradedBuildId)).toBeTruthy();

        const data = buildIdsProgressiveDecode(upgradedBuildId);
        expect(data[0]).toBe(CURRENT_BUILD_ID);
    });
});
