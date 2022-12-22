import { WeaponType } from "@src/data/Weapon";
import { AssignedPerkValue } from "@src/reducers/build-finder/build-finder-selection-slice";
import { findBuilds, MatchingBuild } from "@src/reducers/build-finder/find-builds";

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
