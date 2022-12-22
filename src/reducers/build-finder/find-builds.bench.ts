import {benchmarkSuite} from "jest-bench";
import {findBuilds} from "@src/reducers/build-finder/find-builds";
import {WeaponType} from "@src/data/Weapon";

benchmarkSuite("findBuilds", {
    ["random expensive test"]: () => {
        findBuilds(
            WeaponType.Repeater,
            {
                "Aetheric Evasion": 3,
                "Catalyst": 3,
                "Deconstruction": 3,
                "Galvanized": 3,
                "Medic": 3,
                "Merciless": 3,
                "Pacifier": 3,
                "Stop": 3,
                "Vampiric": 3,
                "Weighted Strikes": 3,
                "Zeal": 3
            },
            50,
            {
                removeExotics: false,
                removeLegendary: true,
            }
        );
    }
});
