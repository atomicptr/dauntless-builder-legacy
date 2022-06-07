import {weaponBuildIdentifier, WeaponType} from "@src/data/Weapon";

describe("weapon build identifier", () => {
    it("should return aetherstrikers", () => {
        expect(weaponBuildIdentifier(WeaponType.AetherStrikers)).toBe("aetherstrikers");
    })
});
