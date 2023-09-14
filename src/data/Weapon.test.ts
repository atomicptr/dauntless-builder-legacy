import { weaponBuildIdentifier, WeaponType } from "@src/data/Weapon";
import { describe, expect, it } from "bun:test";

describe("weapon build identifier", () => {
    it("should return aetherstrikers", () => {
        expect(weaponBuildIdentifier(WeaponType.AetherStrikers)).toBe("aetherstrikers");
    });
});
