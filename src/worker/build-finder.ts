import { WeaponType } from "@src/data/Weapon";
import { AssignedPerkValue } from "@src/reducers/build-finder/build-finder-selection-slice";
import { findBuilds, FinderItemDataOptions } from "@src/reducers/build-finder/find-builds";

interface Data {
    weaponType: WeaponType | null;
    requestedPerks: AssignedPerkValue | AssignedPerkValue[];
    maxBuilds: number;
    options: FinderItemDataOptions;
}

const onMessage = (e: MessageEvent) => {
    const { weaponType, requestedPerks, maxBuilds, options } = e.data as Data;

    if (!Array.isArray(requestedPerks)) {
        const builds = findBuilds(weaponType, requestedPerks, maxBuilds, options);
        self.postMessage(builds);
        self.close();
        return;
    }

    const result = [];

    for (const perks of requestedPerks) {
        const builds = findBuilds(weaponType, perks, maxBuilds, options);
        result.push(builds);
    }

    self.postMessage(result);
    self.close();
};

self.addEventListener("message", onMessage, false);
