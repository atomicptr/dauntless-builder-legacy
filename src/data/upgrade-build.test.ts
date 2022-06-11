import {convertVersion3To4, upgradeBuild} from "@src/data/upgrade-build";
import Hashids from "hashids";
import {BuildModel, CURRENT_BUILD_ID, HASHIDS_SALT} from "@src/data/BuildModel";


describe("upgrading builds", () => {
    // TODO: get builds for the missing versions and some edge cases
    const v3BuildId = "dbU0wFWC74i85CqFxCyTwTBTkTApHaC6VfeFbCgFjQhoCjmc1tpCmNcWCjkIv";

    const hashids = new Hashids(HASHIDS_SALT);

    it("should update build from v3 to v4", () => {
        const data = hashids.decode(convertVersion3To4(v3BuildId));
        expect(BuildModel.isValid(v3BuildId)).toBeTruthy();
        expect(data[0]).toBe(4);
    });

    it("should upgrade a build to current version", () => {
        const upgradedBuildId = upgradeBuild(v3BuildId);
        expect(BuildModel.isValid(upgradedBuildId)).toBeTruthy();

        const data = hashids.decode(upgradedBuildId);
        expect(data[0]).toBe(CURRENT_BUILD_ID);
    })
})
