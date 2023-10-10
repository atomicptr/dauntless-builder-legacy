import { useAppSelector } from "@src/hooks/redux";
import { selectConfiguration } from "@src/reducers/configuration/configuration-slice";
import log from "@src/utils/logger";
import ReactGA from "react-ga4";

const Tracking = () => {
    const configuration = useAppSelector(selectConfiguration);

    // if user has do not track set, don't do anything
    if (navigator.doNotTrack !== "1") {
        return null;
    }

    // tracking has not been enabled, skip...
    if (!configuration.tracking.enabled) {
        return;
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
