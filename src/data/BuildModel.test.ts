import {
    BuildModel,
    findArmourByName,
    findCellByVariantName,
    findLanternByName,
    findOmnicellByName,
    findPartByName,
    findPartInBuild,
    findPerkByName,
    findWeaponByName,
    mapIdByName,
    partTypeByWeaponType
} from "@src/data/BuildModel";
import {WeaponType} from "@src/data/Weapon";
import {PartType} from "@src/data/Part";
import {NamesMapType} from "@src/data/NamesMap";

describe("parse build (v6): YwfzTb6sgCRwU8NsZTmTKTzUPrcJC43ta5C0CQBh8eU0CvAI3whxCxXswFMvFX", () => {
    const buildId = "YwfzTb6sgCRwU8NsZTmTKTzUPrcJC43ta5C0CQBh8eU0CvAI3whxCxXswFMvFX";

    it("should be valid", () => {
        expect(BuildModel.isValid(buildId)).toBeTruthy();
    });

    it("should deserialize properly", () => {
        const build = BuildModel.tryDeserialize(buildId);

        expect(build.version).toBe(6);
        expect(build.weaponName).toBe("Hypothermica");
        expect(build.weaponSurged).toBe(true);
        expect(build.weaponPart1).toBeNull();
        expect(build.weaponPart2).toBeNull();
        expect(build.weaponPart3).toBeNull();
        expect(build.bondWeapon).toBe("Onus of Boreus");
        expect(build.weaponCell1).toBe("+3 Assassin's Frenzy Cell");
        expect(build.weaponCell2).toBe("+3 Adrenaline Cell");
        expect(build.headName).toBe("Timeweave Helm");
        expect(build.headSurged).toBe(true);
        expect(build.headCell).toBe("+3 Predator Cell");
        expect(build.torsoName).toBe("Timeweave Robes");
        expect(build.torsoSurged).toBe(true);
        expect(build.torsoCell).toBe("+3 Berserker Cell");
        expect(build.armsName).toBe("Torgadoro's Brawn");
        expect(build.armsSurged).toBe(true);
        expect(build.armsCell).toBe("+3 Berserker Cell");
        expect(build.legsName).toBe("Thrax's Guile");
        expect(build.legsSurged).toBe(true);
        expect(build.legsCell).toBe("+3 Cunning Cell");
        expect(build.lantern).toBe("Pangar's Shine");
        expect(build.lanternCell).toBe("+3 Energized Cell");
        expect(build.omnicell).toBe("Discipline");
    });

    it("should properly serialize again", () => {
        const build = BuildModel.tryDeserialize(buildId);
        expect(build.serialize()).toBe(buildId);
    });

    it("should be able to use build.data", () => {
        const build = BuildModel.tryDeserialize(buildId);
        expect(build.data.weapon).not.toBeNull();
        expect(build.data.head).not.toBeNull();
        expect(build.data.torso).not.toBeNull();
        expect(build.data.arms).not.toBeNull();
        expect(build.data.legs).not.toBeNull();
        expect(build.data.omnicell).not.toBeNull();
        expect(build.data.lantern).not.toBeNull();
        expect(build.data.bondWeapon).not.toBeNull();
    });
});

describe("parse build with mods: (v6) EQfPT1ZsNC6McwsmcyC6TwPIoeIJC3pUBzFoCpMfPZcbCW2TBdSBCrZhLSoESY", () => {
    const buildId = "EQfPT1ZsNC6McwsmcyC6TwPIoeIJC3pUBzFoCpMfPZcbCW2TBdSBCrZhLSoESY";

    it("should be valid", () => {
        expect(BuildModel.isValid(buildId)).toBeTruthy();
    });

    it("should deserialize properly", () => {
        const build = BuildModel.tryDeserialize(buildId);

        expect(build.version).toBe(6);
        expect(build.weaponName).toBe("Electric Cruelties");
        expect(build.weaponSurged).toBe(true);
        expect(build.weaponPart1).toBe("Reaper's Dance");
        expect(build.weaponPart2).toBe("Hurricane Blades");
        expect(build.weaponPart3).toBeNull();
        expect(build.bondWeapon).toBe("Sahvyt's Pincers");
        expect(build.weaponCell1).toBe("+3 Molten Cell");
        expect(build.weaponCell2).toBe("+3 Fortress Cell");
        expect(build.headName).toBe("Timeweave Helm");
        expect(build.headSurged).toBe(true);
        expect(build.headCell).toBe("+3 Predator Cell");
        expect(build.torsoName).toBe("Timeweave Robes");
        expect(build.torsoSurged).toBe(true);
        expect(build.torsoCell).toBe("+3 Berserker Cell");
        expect(build.armsName).toBe("Torgadoro's Brawn");
        expect(build.armsSurged).toBe(true);
        expect(build.armsCell).toBe("+3 Berserker Cell");
        expect(build.legsName).toBe("Bladed Boots");
        expect(build.legsSurged).toBe(true);
        expect(build.legsCell).toBe("+3 Pulse Cell");
        expect(build.lantern).toBe("Skarn's Defiance");
        expect(build.lanternCell).toBe("+3 Molten Cell");
        expect(build.omnicell).toBe("Bastion");
    });

    it("should be able to use build.data.parts", () => {
        const build = BuildModel.tryDeserialize(buildId);

        expect(build.data.parts?.mod?.name).toBe("Hurricane Blades");
        expect(build.data.parts?.special?.name).toBe("Reaper's Dance");
    });
});

describe("parse repeater build (v6): yKfETJ7FBCaoFOMcoSYh0Cv4hrdIbConSeyH7CMyHRsJCVECjbhwCaziQFgRSv", () => {
    const buildId = "yKfETJ7FBCaoFOMcoSYh0Cv4hrdIbConSeyH7CMyHRsJCVECjbhwCaziQFgRSv";

    it("should be able to use build.data.parts", () => {
        const build = BuildModel.tryDeserialize(buildId);

        expect(build.data.parts?.chamber?.name).toBe("Marksman Chamber");
        expect(build.data.parts?.grip?.name).toBe("Captain's Grip");
        expect(build.data.parts?.mod?.name).toBe("Precision Sights");
    });
});

describe("parse build without weapon (v6): nNfqTxTzTXTVTnTzTjTOTV6HxC3pUMefPCnEHgsBCAMuLAsaCbRI0FrASA", () => {
    const buildId = "nNfqTxTzTXTVTnTzTjTOTV6HxC3pUMefPCnEHgsBCAMuLAsaCbRI0FrASA";

    it("should deserialize properly", () => {
        const build = BuildModel.tryDeserialize(buildId);

        expect(build.weaponName).toBeNull();
        expect(build.headName).not.toBeNull();
    })

    it("build.part should return null", () => {
        const buildId = "NBf2T5TpTyTqTWTYT4TnTJ8ImCA5FgqHBCKnHrsWCk1uK3HgC5efZF8As5";
        const build = BuildModel.tryDeserialize("NBf2T5TpTyTqTWTYT4TnTJ8ImCA5FgqHBCKnHrsWCk1uK3HgC5efZF8As5");
        expect(build.data.parts).toBeNull();
    });
});

describe("parse invalid build", () => {
    const buildId = "dQw4w9WgXcQ";

    it("should not be valid", () => {
        expect(BuildModel.isValid(buildId)).toBeFalsy();
    })

    it("should not deserialize", () => {
        expect(BuildModel.tryDeserialize(buildId).serialize()).toBe(BuildModel.empty().serialize());
    })

    it("build.part should return null with an invalid weapon set", () => {
        const buildId = "NBf2T5TpTyTqTWTYT4TnTJ8ImCA5FgqHBCKnHrsWCk1uK3HgC5efZF8As5";
        const build = BuildModel.tryDeserialize("NBf2T5TpTyTqTWTYT4TnTJ8ImCA5FgqHBCKnHrsWCk1uK3HgC5efZF8As5");
        build.weaponName = "Shrike Legs";
        expect(build.data.parts).toBeNull();
    });
});

describe("find* functions", () => {
    describe("find weapon by name", () => {
        it("should return a weapon object", () => {
            const weapon = findWeaponByName("The Hunger");
            expect(weapon?.name).toBe("The Hunger");
        });

        it("should return null on invalid name", () => {
            expect(findWeaponByName("Shrike Legs")).toBeNull();
        });
    })

    describe("find omnicell by name", () => {
        it("should return an omnicell object", () => {
            const omnicell = findOmnicellByName("Iceborne");
            expect(omnicell?.name).toBe("Iceborne");
        });

        it("should return null on invalid name", () => {
            expect(findOmnicellByName("Shrike Cell")).toBeNull();
        });
    })

    describe("find armour by name", () => {
        it("should return an armour object", () => {
            const armour = findArmourByName("Prismatic Grace");
            expect(armour?.name).toBe("Prismatic Grace");
        });

        it("should return null on invalid name", () => {
            expect(findArmourByName("Shrike Cell")).toBeNull();
        });
    })

    describe("find lantern by name", () => {
        it("should return an lantern object", () => {
            const lantern = findLanternByName("Pangar's Shine");
            expect(lantern?.name).toBe("Pangar's Shine");
        });

        it("should return null on invalid name", () => {
            expect(findLanternByName("Shrike Cell")).toBeNull();
        });
    })

    describe("find perk by name", () => {
        it("should return an perk object", () => {
            const perk = findPerkByName("Adrenaline");
            expect(perk?.name).toBe("Adrenaline");
        });

        it("should return null on invalid name", () => {
            expect(findPerkByName("Shrike Cell")).toBeNull();
        });
    })

    describe("find part by name", () => {
        it("should return an part object", () => {
            const part = findPartByName(WeaponType.Sword, PartType.Special, "Ardent Cyclone");
            expect(part?.name).toBe("Ardent Cyclone");
        });

        it("should return null on invalid combination", () => {
            expect(findPartByName(WeaponType.Repeater, PartType.Special, "Ardent Cyclone")).toBeNull();
        });
    })

    describe("find part in build", () => {
        it("should return a warpike mod", () => {
            const build = BuildModel.tryDeserialize("pnfXTKOfwCWYCNXuocEueTxptqriMCRaH7nfLCK2Sk5cZCmXfeJhdCP6spF26FQ");
            const part = findPartInBuild(WeaponType.WarPike, PartType.Mod, build);
            expect(part?.name).toBe("Executioner's Spearhead");
        });

        it("should return a repeater chamber", () => {
            const build = BuildModel.tryDeserialize("yKfETegfBCdyCEXsoSYhpIv8u7UbCXMUeyH7CWvUZUJCVECjbhwC6OuQFgRSB");
            const part = findPartInBuild(WeaponType.Repeater, PartType.Chamber, build);
            expect(part?.name).toBe("Marksman Chamber");
        })

        it("should not return an axe grip", () => {
            const build = BuildModel.tryDeserialize("MRfWT56hXCYJUn4CycWt8TZIrF5CKKUq7czC11Ur3cKCjKHJnT6C68ujF7PHj");
            expect(findPartInBuild(WeaponType.Axe, PartType.Grip, build)).toBeNull();
        })
    });

    describe("find cell by variant name", () => {
        it("should find pulse", () => {
            const cell = findCellByVariantName("+2 Pulse Cell");
            expect(cell?.name).toBe("Pulse Cell");
        });

        it("should not find nonsense", () => {
            expect(findCellByVariantName("+3 Rams Guard")).toBeNull();
        });
    });
});

describe("map id by name", () => {
    it("should find the id for Boreal Epiphany", () => {
        expect(mapIdByName(NamesMapType.Armour, "Boreal Epiphany")).toBe(1);
    });
});

describe("determine map part type by weapon type", () => {
    it("should map WeaponType.ChainBlades to NamesMapType.ChainbladesPart", () => {
        expect(partTypeByWeaponType(WeaponType.ChainBlades)).toBe(NamesMapType.ChainbladesPart);
    })
})
