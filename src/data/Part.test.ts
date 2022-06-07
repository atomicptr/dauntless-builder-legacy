import {partBuildIdentifier, PartType} from "@src/data/Part";


describe("part build identifier", () => {
    it("should return grips", () => {
        expect(partBuildIdentifier(PartType.Grip)).toBe("grips");
    });
});
