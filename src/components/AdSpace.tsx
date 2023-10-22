import { FeaturedVideo } from "@mui/icons-material";
import { Box, useTheme } from "@mui/material";
import { useAppSelector } from "@src/hooks/redux";
import { selectEvents } from "@src/reducers/events/events-slice";
import { adsEnabled } from "@src/utils/env-tools";
import log from "@src/utils/logger";
import React, { useEffect } from "react";

export enum UnitType {
    RightRail = "right_rail",
    BottomRail = "bottom_rail",
    LeftRail = "left_rail",
}

interface AdSpaceProps {
    unitType: UnitType;
}

const AdSpace: React.FC<AdSpaceProps> = ({ unitType }) => {
    const theme = useTheme();

    const events = useAppSelector(selectEvents);

    const selectorName = `db_unit_${unitType.toString()}`;

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

    if (DB_DEVMODE) {
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
