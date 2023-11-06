import { FeaturedVideo } from "@mui/icons-material";
import { Box, useTheme } from "@mui/material";
import { eventsAtom } from "@src/state/events";
import { adsEnabled } from "@src/utils/env-tools";
import log from "@src/utils/logger";
import { useAtomValue } from "jotai";
import React, { useEffect } from "react";
import useDevMode from "@src/hooks/dev-mode";
import md5 from "md5";

export enum UnitType {
    RightRail = "right_rail",
    BottomRail = "bottom_rail",
    LeftRail = "left_rail",
    Skyscraper = "sky_atf",
}

interface AdSpaceProps {
    name: string;
    unitType: UnitType;
}

const AdSpace: React.FC<AdSpaceProps> = ({ name, unitType }) => {
    const theme = useTheme();
    const isDevMode = useDevMode();

    const events = useAtomValue(eventsAtom);

    const selectorName = `dbu_${md5(name + unitType.toString())}`;

    useEffect(() => {
        if (!events.playwireSetupHasFinished) {
            return;
        }

        const initUnit = async () => {
            try {
                await window.ramp.addUnits([
                    {
                        selectorId: selectorName,
                        type: unitType,
                    },
                ]);
                window.ramp.displayUnits();
            } catch (error) {
                log.error("ramp: could not add unit", { error });
                window.ramp.displayUnits();
            }
        };
        initUnit();
    }, [events.playwireSetupHasFinished, selectorName, unitType]);

    if (!adsEnabled) {
        return null;
    }

    if (isDevMode) {
        return (
            <Box
                sx={{
                    alignItems: "center",
                    border: `5px dashed ${theme.palette.primary.main}`,
                    color: theme.palette.primary.main,
                    display: "flex",
                    flexGrow: 10,
                    justifyContent: "center",
                    m: 1,
                    p: 1,
                }}
            >
                <FeaturedVideo />
            </Box>
        );
    }

    return <div id={selectorName} />;
};

export default React.memo(AdSpace);
