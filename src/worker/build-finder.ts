import { WeaponType } from "@src/data/Weapon";
import { AssignedPerkValue } from "@src/features/build-finder/build-finder-selection-slice";
import { findBuilds } from "@src/features/build-finder/find-builds";

interface Data {
    weaponType: WeaponType | null;
    requestedPerks: AssignedPerkValue;
    maxBuilds: number;
}

const onMessage = (e: MessageEvent) => {
    const { weaponType, requestedPerks, maxBuilds } = e.data as Data;
    const builds = findBuilds(weaponType, requestedPerks, maxBuilds);
    self.postMessage(builds);
    self.close();
};

self.addEventListener("message", onMessage, false);
