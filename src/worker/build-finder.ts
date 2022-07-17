import { AssignedPerkValue } from "@src/features/build-finder/build-finder-selection-slice";
import { findBuilds, FinderItemData, FinderItemDataOptions } from "@src/features/build-finder/find-builds";

interface Data {
    itemData: FinderItemData;
    requestedPerks: AssignedPerkValue;
    maxBuilds: number;
    options: FinderItemDataOptions;
}

const onMessage = (e: MessageEvent) => {
    const { itemData, requestedPerks, maxBuilds, options } = e.data as Data;
    const builds = findBuilds(itemData, requestedPerks, maxBuilds, options);
    self.postMessage(builds);
    self.close();
};

self.addEventListener("message", onMessage, false);
