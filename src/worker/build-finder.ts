import { WeaponType } from "@src/data/Weapon";
import { AssignedPerkValue } from "@src/features/build-finder/build-finder-selection-slice";
import { findBuilds, FinderItemDataOptions } from "@src/features/build-finder/find-builds";

interface Data {
    weaponType: WeaponType | null;
    requestedPerks: AssignedPerkValue;
    maxBuilds: number;
    options: FinderItemDataOptions;
}

const onMessage = (e: MessageEvent) => {
    const { weaponType, requestedPerks, maxBuilds, options } = e.data as Data;
    const builds = findBuilds(weaponType, requestedPerks, maxBuilds, options);
    self.postMessage(builds);
    self.close();
};

self.addEventListener("message", onMessage, false);
