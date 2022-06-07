import {isExotic} from "@src/data/ItemRarity";
import {findArmourByName, findWeaponByName} from "@src/data/BuildModel";

describe("is item exotic", () => {
    it("Recruits Axe should not be exotic", () => {
        const weapon = findWeaponByName("Recruit's Axe")
        expect(isExotic(weapon!)).toBeFalsy();
    })

    it("Tragic Echo should be exotic", () => {
        const armour = findArmourByName("Tragic Echo")
        expect(isExotic(armour!)).toBeTruthy();
    })
});
