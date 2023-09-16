import { findArmourByName, findWeaponByName } from "@src/data/BuildModel";
import { isExotic } from "@src/data/ItemRarity";
import { describe, expect, it } from "bun:test";

describe("is item exotic", () => {
    it("Recruits Axe should not be exotic", () => {
        const weapon = findWeaponByName("Recruit's Axe");
        expect(weapon !== null ? isExotic(weapon) : true).toBeFalsy();
    });

    it("Tragic Echo should be exotic", () => {
        const armour = findArmourByName("Tragic Echo");
        expect(armour !== null ? isExotic(armour) : null).toBeTruthy();
    });
});
