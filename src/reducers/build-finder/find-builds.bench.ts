import { WeaponType } from "@src/data/Weapon";
import { findBuilds } from "@src/reducers/build-finder/find-builds";
import Benchmark, { Event } from "benchmark";

const suites: { [name: string]: () => void } = {
    ["a random build test"]: () => {
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
    ["another random build test"]: () => {
        findBuilds(
            WeaponType.Repeater,
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
                removeExotics: false,
                removeLegendary: true,
            },
        );
    },
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
    ["find builds with a lot of +3 options"]: () => {
        findBuilds(
            WeaponType.Sword,
            {
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
            },
            50,
            {
                removeExotics: true,
                removeLegendary: true,
            },
        );
    },
    ["find builds with exotics"]: () => {
        findBuilds(
            WeaponType.Repeater,
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
};

const suite = new Benchmark.Suite();

for (const suiteName in suites) {
    suite.add(suiteName, suites[suiteName]);
}

/* eslint-disable no-console */
suite.on("cycle", (ev: Event) => console.log("BENCH:\t", String(ev.target)));
suite.on("error", console.error);
suite.on("complete", () => console.log("BENCH: done"));

console.log("dauntless-builder.com: Benchmark Tool - findBuilds");
suite.run({ name: "findBuilds" });
