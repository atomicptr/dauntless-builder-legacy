import { findArmourByName, findWeaponByName } from "@src/data/BuildModel";
import { WeaponType } from "@src/data/Weapon";
import { AssignedPerkValue } from "@src/reducers/build-finder/build-finder-selection-slice";
import { findBuilds, MatchingBuild } from "@src/reducers/build-finder/find-builds";
import { describe, expect, it } from "bun:test";

describe("findBuilds", () => {
    const hasWhatYouWanted = (requestedPerks: AssignedPerkValue, build: MatchingBuild) => {
        for (const perkName in requestedPerks) {
            const requestedValue = requestedPerks[perkName];

            expect(perkName in build.perks).toBeTruthy();
            expect(build.perks[perkName]).toBeGreaterThanOrEqual(requestedValue);
        }
    };

    const findsTheRightBuilds = (weaponType: WeaponType, requestedPerks: AssignedPerkValue) => {
        const builds = findBuilds(weaponType, requestedPerks, 50, {
            removeExotics: true,
            removeLegendary: true,
        });

        expect(builds.length > 0).toBeTruthy();
        builds.forEach(build => hasWhatYouWanted(requestedPerks, build));
    };

    it("can find builds", () => {
        findsTheRightBuilds(WeaponType.Hammer, {});
    });

    it("finds the right builds", () => {
        findsTheRightBuilds(WeaponType.WarPike, {
            Adrenaline: 6,
            Endurance: 6,
            Molten: 6,
            Parasitic: 6,
            Predator: 6,
            Pulse: 6,
        });
    });

    it("finds the right builds when asking for 5x Alacrity cell builds", () => {
        findsTheRightBuilds(WeaponType.ChainBlades, {
            Adrenaline: 6,
            Agility: 6,
            "Assassin's Frenzy": 6,
        });
    });

    it("finds the right builds when asking for 5x Alacrity cell builds", () => {
        findsTheRightBuilds(WeaponType.ChainBlades, {
            Adrenaline: 6,
            Agility: 6,
            "Assassin's Frenzy": 6,
            Conditioning: 6,
            Endurance: 6,
        });
    });

    it("finds the right builds when asking for something similar to a meta build", () => {
        findsTheRightBuilds(WeaponType.Sword, {
            Adrenaline: 6,
            Berserker: 3,
            Catalyst: 3,
            Cunning: 6,
            Endurance: 6,
            Overpower: 3,
            Predator: 6,
        });
    });

    it("finds a certain build", () => {
        const builds = findBuilds(
            WeaponType.Sword,
            {
                Adrenaline: 6,
                Berserker: 3,
                Catalyst: 3,
                Cunning: 6,
                Endurance: 6,
                Overpower: 3,
                Predator: 6,
            },
            50,
            {
                removeLegendary: true,
            },
        );

        const build = builds.find(
            build =>
                build.build.weapon.name === "Cry of the Shrike" &&
                build.cellsSlotted.weapon[0] === "Endurance" &&
                build.cellsSlotted.weapon[1] === "Endurance" &&
                build.build.head.name == "Timeweave Helm" &&
                build.cellsSlotted.head[0] === "Cunning" &&
                build.build.torso.name === "Skraevwing Jacket" &&
                build.cellsSlotted.torso[0] === "Adrenaline" &&
                build.build.arms.name === "Torgadoro's Brawn" &&
                build.cellsSlotted.arms[0] === "Berserker" &&
                build.build.legs.name === "Thrax's Guile" &&
                build.cellsSlotted.legs[0] === "Predator" &&
                build.cellsSlotted.lantern[0] === "Catalyst",
        );

        expect(build).toBeTruthy();
    });

    it("should find the number of max builds for a wide selection", () => {
        const maxBuilds = 100;

        const builds = findBuilds(
            WeaponType.Sword,
            {
                Berserker: 3,
                Tenacious: 6,
            },
            maxBuilds,
        );

        expect(builds.length).toBe(maxBuilds);
    });

    it("should find the number of max builds for a wide selection with reduced maxBuilds", () => {
        const maxBuilds = 5;

        const builds = findBuilds(
            WeaponType.Sword,
            {
                Berserker: 3,
                Tenacious: 6,
            },
            maxBuilds,
        );

        expect(builds.length).toBe(maxBuilds);
    });

    it("finds builds even with a LOT of +3 options", () => {
        findsTheRightBuilds(WeaponType.Sword, {
            Acidic: 3,
            Adrenaline: 3,
            Aegis: 3,
            Aetherborne: 3,
            Aetherhunter: 3,
            "Aetheric Attunement": 3,
            Agility: 3,
            "Assassin's Vigour": 3,
            Barbed: 3,
            Berserker: 3,
            Cunning: 3,
        });
    });

    it("should support weapon prepicking", () => {
        const builds = findBuilds(
            WeaponType.Sword,
            {
                "Assassin's Vigour": 6,
                Barbed: 6,
                Berserker: 3,
            },
            50,
            {
                pickerWeapon: findWeaponByName("Training Sword"),
                removeExotics: true,
                removeLegendary: true,
            },
        );

        expect(builds.length > 0).toBeTruthy();

        builds.forEach(build => {
            expect(build.build.weapon.name).toBe("Training Sword");
        });
    });

    it("should support armour prepicking", () => {
        const builds = findBuilds(
            WeaponType.Sword,
            {
                Aetherborne: 6,
                "Assassin's Vigour": 6,
            },
            50,
            {
                pickerArms: findArmourByName("Malkarion's Grasp"),
                pickerHead: findArmourByName("Adversary's Guile"),
                pickerLegs: findArmourByName("Adversary's Drive"),
                pickerTorso: findArmourByName("Spellbound Wings"),
                removeExotics: true,
                removeLegendary: true,
            },
        );
        expect(builds.length > 0).toBeTruthy();

        builds.forEach(build => {
            expect(build.build.head.name).toBe("Adversary's Guile");
            expect(build.build.torso.name).toBe("Spellbound Wings");
            expect(build.build.arms.name).toBe("Malkarion's Grasp");
            expect(build.build.legs.name).toBe("Adversary's Drive");
        });
    });

    it("should support exotics", () => {
        const builds = findBuilds(
            WeaponType.Sword,
            {
                Aetherhunter: 6,
                Bladestorm: 6,
                Rage: 6,
                Ragehunter: 6,
                Tenacious: 6,
            },
            50,
            {
                removeExotics: false,
                removeLegendary: true,
            },
        );
        expect(builds.length > 0).toBeTruthy();

        const buildsWithHunger = builds.filter(build => build.build.weapon.name === "The Hunger");
        expect(buildsWithHunger.length).toBeGreaterThanOrEqual(4);
    });

    it("finds builds with legendary enabled", () => {
        const builds = findBuilds(
            WeaponType.Sword,
            {
                Aegis: 6,
                Drop: 3,
                Endurance: 3,
                Galvanized: 6,
                Guardian: 6,
                Savagery: 6,
                Sprinter: 6,
            },
            50,
            {
                removeExotics: false,
                removeLegendary: false,
            },
        );
        expect(builds.length > 0).toBeTruthy();
    });

    it("finds builds with legendary enabled", () => {
        const builds = findBuilds(
            WeaponType.Sword,
            {
                Aegis: 6,
                Drop: 3,
                Endurance: 3,
                Galvanized: 6,
                Guardian: 6,
                Savagery: 6,
                Sprinter: 6,
            },
            50,
            {
                removeExotics: false,
                removeLegendary: false,
            },
        );
        expect(builds.length > 0).toBeTruthy();
    });

    it("finds builds with legendary enabled and something prepicked", () => {
        const builds = findBuilds(
            WeaponType.Sword,
            {
                Aegis: 6,
                Drop: 3,
                Galvanized: 6,
                Guardian: 6,
                Savagery: 6,
                Sprinter: 6,
            },
            50,
            {
                pickerWeapon: findWeaponByName("Cry of the Shrike"),
                removeExotics: false,
                removeLegendary: false,
            },
        );
        expect(builds.length > 0).toBeTruthy();
    });

    it("finds builds with legendary enabled and The Hunger prepicked", () => {
        const builds = findBuilds(
            WeaponType.Sword,
            {
                Aegis: 6,
                Berserker: 3,
                Drop: 3,
                Galvanized: 6,
                Guardian: 6,
                Savagery: 6,
                Sprinter: 3,
            },
            50,
            {
                pickerWeapon: findWeaponByName("The Hunger"),
                removeExotics: false,
                removeLegendary: false,
            },
        );
        expect(builds.length > 0).toBeTruthy();
    });

    it("finds no builds when the criterias are nonsense", () => {
        const builds = findBuilds(
            WeaponType.Hammer,
            {
                Adrenaline: 6,
                Agility: 6,
                "Assassin's Frenzy": 6,
                Conditioning: 6,
                Endurance: 6,
                Evasion: 6,
                "Evasive Fury": 6,
            },
            1,
        );
        expect(builds.length).toBe(0);
    });

    it("finds builds with exotics enabled", () => {
        const builds = findBuilds(
            WeaponType.ChainBlades,
            {
                Berserker: 3,
                Bladestorm: 3,
                Guardian: 3,
                Invigorated: 3,
                Parasitic: 3,
                Pulse: 3,
                Rage: 3,
                Rushdown: 3,
                Tactician: 3,
                Vampiric: 3,
                "Weighted Strikes": 3,
            },
            50,
            {
                removeExotics: false,
                removeLegendary: true,
            },
        );
        expect(builds.length > 0).toBeTruthy();
    });

    it("finds no builds with exotics disabled", () => {
        const builds = findBuilds(
            WeaponType.ChainBlades,
            {
                Berserker: 3,
                Bladestorm: 3,
                Guardian: 3,
                Invigorated: 3,
                Parasitic: 3,
                Pulse: 3,
                Rage: 3,
                Rushdown: 3,
                Tactician: 3,
                Vampiric: 3,
                "Weighted Strikes": 3,
            },
            50,
            {
                removeExotics: true,
                removeLegendary: true,
            },
        );
        expect(builds.length).toBe(0);
    });

    it("finds builds with legendary weapons enabled", () => {
        const builds = findBuilds(
            WeaponType.ChainBlades,
            {
                Berserker: 3,
                Bladestorm: 3,
                Guardian: 3,
                Invigorated: 3,
                Parasitic: 3,
                Pulse: 3,
                Rage: 3,
                Rushdown: 3,
                Tactician: 3,
                Vampiric: 3,
                "Weighted Strikes": 3,
            },
            50,
            {
                removeExotics: true,
                removeLegendary: false,
            },
        );
        expect(builds.length > 0).toBeTruthy();
    });

    it("finds builds with 1 perk selected", () => {
        const builds = findBuilds(
            WeaponType.Sword,
            {
                Tenacious: 3,
            },
            50,
            {
                removeExotics: true,
                removeLegendary: true,
            },
        );
        expect(builds.length > 0).toBeTruthy();
    });

    it("finds builds with 2 perks selected", () => {
        const builds = findBuilds(
            WeaponType.Sword,
            {
                Tenacious: 6,
            },
            50,
            {
                removeExotics: true,
                removeLegendary: true,
            },
        );
        expect(builds.length > 0).toBeTruthy();
    });

    it("finds builds with 3 perks selected", () => {
        const builds = findBuilds(
            WeaponType.Sword,
            {
                Relentless: 3,
                Tenacious: 6,
            },
            50,
            {
                removeExotics: true,
                removeLegendary: true,
            },
        );
        expect(builds.length > 0).toBeTruthy();
    });

    it("finds builds with 4 perks selected", () => {
        const builds = findBuilds(
            WeaponType.Sword,
            {
                Relentless: 3,
                "Shellshock Resist": 3,
                Tenacious: 6,
            },
            50,
            {
                removeExotics: true,
                removeLegendary: true,
            },
        );
        expect(builds.length > 0).toBeTruthy();
    });

    it("finds builds with 5 perks selected", () => {
        const builds = findBuilds(
            WeaponType.Sword,
            {
                Drop: 3,
                Relentless: 3,
                "Shellshock Resist": 3,
                Tenacious: 6,
            },
            50,
            {
                removeExotics: true,
                removeLegendary: true,
            },
        );
        expect(builds.length > 0).toBeTruthy();
    });

    it("finds builds with 6 perks selected", () => {
        const builds = findBuilds(
            WeaponType.Sword,
            {
                Drop: 6,
                Relentless: 3,
                "Shellshock Resist": 3,
                Tenacious: 6,
            },
            50,
            {
                removeExotics: true,
                removeLegendary: true,
            },
        );
        expect(builds.length > 0).toBeTruthy();
    });

    it("finds builds with 7 perks selected", () => {
        const builds = findBuilds(
            WeaponType.Sword,
            {
                Drop: 6,
                Merciless: 3,
                Relentless: 3,
                "Shellshock Resist": 3,
                Tenacious: 6,
            },
            50,
            {
                removeExotics: true,
                removeLegendary: true,
            },
        );
        expect(builds.length > 0).toBeTruthy();
    });

    it("finds builds with 8 perks selected", () => {
        const builds = findBuilds(
            WeaponType.Sword,
            {
                Drop: 6,
                Merciless: 3,
                Molten: 3,
                Relentless: 3,
                "Shellshock Resist": 3,
                Tenacious: 6,
            },
            50,
            {
                removeExotics: true,
                removeLegendary: true,
            },
        );
        expect(builds.length > 0).toBeTruthy();
    });

    it("finds builds with 9 perks selected", () => {
        const builds = findBuilds(
            WeaponType.Sword,
            {
                Drop: 6,
                Merciless: 3,
                Molten: 3,
                "Nine Lives": 3,
                Relentless: 3,
                "Shellshock Resist": 3,
                Tenacious: 6,
            },
            50,
            {
                removeExotics: true,
                removeLegendary: true,
            },
        );
        expect(builds.length > 0).toBeTruthy();
    });

    it("finds builds with 10 perks selected", () => {
        const builds = findBuilds(
            WeaponType.Sword,
            {
                Drop: 6,
                Merciless: 3,
                Molten: 3,
                "Nine Lives": 3,
                Pacifier: 3,
                Relentless: 3,
                "Shellshock Resist": 3,
                Tenacious: 6,
            },
            50,
            {
                removeExotics: true,
                removeLegendary: true,
            },
        );
        expect(builds.length > 0).toBeTruthy();
    });

    it("finds builds with 11 perks selected", () => {
        const builds = findBuilds(
            WeaponType.Sword,
            {
                Drop: 6,
                Merciless: 3,
                Molten: 3,
                "Nine Lives": 3,
                Pacifier: 6,
                Relentless: 3,
                "Shellshock Resist": 3,
                Tenacious: 6,
            },
            50,
            {
                removeExotics: true,
                removeLegendary: true,
            },
        );
        expect(builds.length > 0).toBeTruthy();
    });

    it("finds builds with 12 perks selected", () => {
        const builds = findBuilds(
            WeaponType.Sword,
            {
                Cunning: 3,
                Drop: 6,
                Merciless: 3,
                Molten: 3,
                "Nine Lives": 3,
                Pacifier: 6,
                Relentless: 3,
                "Shellshock Resist": 3,
                Tenacious: 6,
            },
            50,
            {
                removeExotics: true,
                removeLegendary: true,
            },
        );
        expect(builds.length > 0).toBeTruthy();
    });
});
