import {WeaponType} from "@src/data/Weapon";
import {AssignedPerkValue} from "@src/reducers/build-finder/build-finder-selection-slice";
import {findBuilds, MatchingBuild} from "@src/reducers/build-finder/find-builds";

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
            Conditioning: 6,
            Endurance: 6,
        });
    });

    it("finds the right builds when asking for something similar to a meta build", () => {
        findsTheRightBuilds(WeaponType.Sword, {
            "Adrenaline": 6,
            "Berserker": 3,
            "Catalyst": 3,
            "Cunning": 6,
            "Endurance": 6,
            "Overpower": 3,
            "Predator": 6
        });
    });

    it("finds a certain build", () => {
        const builds = findBuilds(
            WeaponType.Sword,
            {
                "Adrenaline": 6,
                "Berserker": 3,
                "Catalyst": 3,
                "Cunning": 6,
                "Endurance": 6,
                "Overpower": 3,
                "Predator": 6
            },
            50,
            {
                removeLegendary: true,
            }
        );

        const build = builds.find(build => (
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
            build.cellsSlotted.lantern[0] === "Catalyst"
        ));

        expect(build).toBeTruthy();
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
});
