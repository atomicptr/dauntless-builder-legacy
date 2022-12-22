import { WeaponType } from "@src/data/Weapon";
import { findBuilds } from "@src/reducers/build-finder/find-builds";
import { benchmarkSuite } from "jest-bench";

benchmarkSuite("findBuilds", {
    ["find builds with 3x Alacrity cells"]: () => {
        findBuilds(
            WeaponType.Repeater,
            {
                Adrenaline: 6,
                Agility: 6,
                "Assassin's Frenzy": 6,
            },
            50,
            {
                removeExotics: false,
                removeLegendary: true,
            },
        );
    },
    ["find builds with 5x Alacrity cells"]: () => {
        findBuilds(
            WeaponType.Repeater,
            {
                Adrenaline: 6,
                Agility: 6,
                "Assassin's Frenzy": 6,
                Conditioning: 6,
                Endurance: 6,
            },
            50,
            {
                removeExotics: false,
                removeLegendary: true,
            },
        );
    },
    ["find no builds due to invalid criteria"]: () => {
        findBuilds(
            WeaponType.Repeater,
            {
                Adrenaline: 6,
                Agility: 6,
                "Assassin's Frenzy": 6,
                Conditioning: 6,
                Endurance: 6,
                Evasion: 6,
                "Evasive Fury": 6,
            },
            50,
            {
                removeExotics: false,
                removeLegendary: true,
            },
        );
    },
    ["random build test"]: () => {
        findBuilds(
            WeaponType.Repeater,
            {
                "Aetheric Evasion": 3,
                Catalyst: 3,
                Deconstruction: 3,
                Galvanized: 3,
                Medic: 3,
                Merciless: 3,
                Pacifier: 3,
                Stop: 3,
                Vampiric: 3,
                "Weighted Strikes": 3,
                Zeal: 3,
            },
            50,
            {
                removeExotics: false,
                removeLegendary: true,
            },
        );
    },
});
