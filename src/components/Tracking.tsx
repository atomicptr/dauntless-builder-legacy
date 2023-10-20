import log from "@src/utils/logger";
import ReactGA from "react-ga4";

const Tracking = () => {
    // if user has do not track set, don't do anything
    if (navigator.doNotTrack !== "1") {
        return null;
    }

    if (DB_GA4_MEASUREMENT_ID) {
        ReactGA.initialize(DB_GA4_MEASUREMENT_ID, {
            testMode: DB_DEVMODE,
        });
        log.debug("enabled GA4");
    }

    return null;
};

export default Tracking;
