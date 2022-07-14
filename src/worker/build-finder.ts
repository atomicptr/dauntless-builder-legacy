import { AssignedPerkValue } from "@src/features/build-finder/build-finder-selection-slice";
import { findBuilds, FinderItemData } from "@src/features/build-finder/find-builds";

interface Data {
    itemData: FinderItemData;
    requestedPerks: AssignedPerkValue;
    maxBuilds: number;
}

const onMessage = (e: MessageEvent) => {
    const { itemData, requestedPerks, maxBuilds } = e.data as Data;
    const builds = findBuilds(itemData, requestedPerks, maxBuilds);
    self.postMessage(builds);
    self.close();
};

self.addEventListener("message", onMessage, false);
