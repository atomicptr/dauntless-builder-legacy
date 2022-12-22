import { WeaponType } from "@src/data/Weapon";
import { AssignedPerkValue } from "@src/reducers/build-finder/build-finder-selection-slice";
import { findBuilds, FinderItemDataOptions } from "@src/reducers/build-finder/find-builds";

interface Data {
    weaponType: WeaponType | null;
    requestedPerks: AssignedPerkValue;
    perksToAdd: string[];
    options: FinderItemDataOptions;
}

const onMessage = (e: MessageEvent) => {
    const { weaponType, requestedPerks, perksToAdd, options } = e.data as Data;

    const result: { [perkName: string]: boolean } = {};

    for (const perk of perksToAdd) {
        const requestedPerkValue = perk in requestedPerks ? requestedPerks[perk] + 3 : 3;
        const newRequestedPerks = { ...requestedPerks, [perk]: requestedPerkValue };

        const builds = findBuilds(weaponType, newRequestedPerks, 1, options);

        result[perk] = builds.length > 0;
    }

    self.postMessage(result);
    self.close();
};

self.addEventListener("message", onMessage, false);
