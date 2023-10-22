import { UnitType } from "@src/components/AdSpace";
import { useAppDispatch } from "@src/hooks/redux";
import { playwireSetupFinished } from "@src/reducers/events/events-slice";
import { adsEnabled } from "@src/utils/env-tools";
import log from "@src/utils/logger";
import React, { useEffect } from "react";
import ReactGA from "react-ga4";

const TrackingRampSetup = () => {
    const dispatch = useAppDispatch();

    useEffect(() => {
        const ga4Enabled = navigator.doNotTrack !== "1" && DB_GA4_MEASUREMENT_ID !== null;

        if (ga4Enabled) {
            ReactGA.initialize(DB_GA4_MEASUREMENT_ID, {
                testMode: DB_DEVMODE,
            });
            log.debug("enabled GA4");
        }

        if (adsEnabled) {
            if (window.ramp) {
                return;
            }

            window.ramp = window.ramp ?? {};
            window.ramp.que = window.ramp.que ?? [];
            window.ramp.passiveMode = true;

            if (ga4Enabled) {
                const gtagFunc = (...args: unknown[]) => window.dataLayer.push(args);

                window._pwGA4PageviewId = Date.now().toString();
                window.dataLayer = window.dataLayer || [];
                window.gtag = window.gtag || gtagFunc;
                window.gtag("js", new Date());
                window.gtag("config", DB_GA4_MEASUREMENT_ID, { send_page_view: false });
                window.gtag("event", "ramp_js", {
                    pageview_id: window._pwGA4PageviewId,
                    send_to: DB_GA4_MEASUREMENT_ID,
                });
            }

            window.ramp.que.push(async () => {
                try {
                    await window.ramp.addUnits([
                        {
                            type: UnitType.RightRail,
                        },
                        {
                            type: UnitType.BottomRail,
                        },
                        {
                            type: UnitType.LeftRail,
                        },
                    ]);
                    window.ramp.displayUnits();
                } catch (error) {
                    log.error("ramp: could not add units", { error });
                    window.ramp.displayUnits();
                }

                dispatch(playwireSetupFinished());
            });

            const rampScript = document.createElement("script");
            rampScript.src = `https://cdn.intergient.com/${DB_PW_PUBLISHER_ID}/${DB_PW_WEBSITE_ID}/ramp.js`;
            rampScript.async = true;
            document.body.appendChild(rampScript);
        }
    }, [dispatch]);

    return null;
};

export default React.memo(TrackingRampSetup);
