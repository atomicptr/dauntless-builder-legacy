import { partBuildIdentifier, PartType } from "@src/data/Part";
import { describe, expect, it } from "bun:test";

describe("part build identifier", () => {
    it("should return grips", () => {
        expect(partBuildIdentifier(PartType.Grip)).toBe("grips");
    });
});
