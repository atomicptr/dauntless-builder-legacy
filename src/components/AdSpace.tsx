import { FeaturedVideo } from "@mui/icons-material";
import { Box, ListSubheader, useTheme } from "@mui/material";
import { eventsAtom, playwireAddInitializedUnit } from "@src/state/events";
import { adsEnabled } from "@src/utils/env-tools";
import log from "@src/utils/logger";
import { useAtom } from "jotai";
import md5 from "md5";
import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";

export enum UnitType {
    BottomRail = "bottom_rail",
    Skyscraper160x600 = "sky_atf",
    Skyscraper300x600 = "sky_btf",
}

export const adSpaceSize = {
    [UnitType.BottomRail]: { height: 50, width: 320 },
    [UnitType.Skyscraper160x600]: { height: 600, width: 160 },
    [UnitType.Skyscraper300x600]: { height: 600, width: 300 },
};

interface AdSpaceProps {
    name: string;
    unitType: UnitType;
    withoutHeader?: boolean;
}

interface AdSpaceWrapperProps {
    children: React.ReactElement;
    withoutHeader?: boolean;
}

const AdSpaceWrapper: React.FC<AdSpaceWrapperProps> = ({ children, withoutHeader }) => {
    const { t } = useTranslation();
    return (
        <Box
            sx={{
                alignItems: "center",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                textAlign: "center",
            }}
        >
            {withoutHeader ? null : <ListSubheader sx={{ userSelect: "none" }}>{t("misc.ad")}</ListSubheader>}
            <Box>{children}</Box>
        </Box>
    );
};

const AdSpace: React.FC<AdSpaceProps> = ({ name, unitType, withoutHeader }) => {
    const theme = useTheme();

    const [events, setEvents] = useAtom(eventsAtom);

    const selectorName = `dbu_${md5(name + unitType.toString())}`;

    const size = unitType in adSpaceSize ? adSpaceSize[unitType as keyof typeof adSpaceSize] : null;

    useEffect(() => {
        if (events.playwireInitializedUnits.indexOf(name) > -1) {
            log.error(`ramp: Unit ${name} (${unitType}) has already been initialized...`);
            return;
        }

        if (DB_DISPLAY_AD_PLACEHOLDERS) {
            setEvents(playwireAddInitializedUnit(name));
            log.debug(`not ramp: initialized unit ${name} (${unitType})`);
        }

        if (!adsEnabled) {
            return;
        }

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

            setEvents(playwireAddInitializedUnit(name));
            log.debug(`ramp: initialized unit ${name} (${unitType})`);
        };
        initUnit();
    }, [events.playwireSetupHasFinished, events.playwireInitializedUnits, selectorName, unitType, setEvents, name]);

    if (DB_DISPLAY_AD_PLACEHOLDERS) {
        return (
            <AdSpaceWrapper withoutHeader={withoutHeader}>
                <Box
                    id={selectorName}
                    sx={{
                        alignItems: "center",
                        background: theme.palette.background.default,
                        border: `5px dashed ${theme.palette.primary.main}`,
                        color: theme.palette.primary.main,
                        display: "flex",
                        height: `${size?.height}px`,
                        justifyContent: "center",
                        m: 1,
                        p: 1,
                        width: `${size?.width}px`,
                    }}
                >
                    <FeaturedVideo />
                </Box>
            </AdSpaceWrapper>
        );
    }

    if (!adsEnabled) {
        return null;
    }

    return (
        <AdSpaceWrapper>
            <div id={selectorName} />
        </AdSpaceWrapper>
    );
};

export default React.memo(AdSpace);
