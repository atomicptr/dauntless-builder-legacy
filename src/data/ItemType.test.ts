import { isArmourType, ItemType, itemTypeData, itemTypeLocalizationIdentifier } from "@src/data/ItemType";

describe("is amrour type", () => {
    it("weapon should not be an armour type", () => {
        expect(isArmourType(ItemType.Weapon)).toBeFalsy();
    });

    it("torso should be an armour type", () => {
        expect(isArmourType(ItemType.Torso)).toBeTruthy();
    });
});

describe("returns the correct item type localization identifier?", () => {
    it("Omnicell should be terms.omnicell", () => {
        expect(itemTypeLocalizationIdentifier(ItemType.Omnicell)).toBe("terms.omnicell");
    });
});

describe("get data by item type", () => {
    it("should return weapons!", () => {
        const weapons = itemTypeData(ItemType.Weapon);
        expect("Malignant Scourge" in weapons).toBeTruthy();
    });
});
