import { Box, useTheme } from "@mui/material";
import { Breakpoint } from "@mui/system";
import AdSpace, { UnitType } from "@src/components/AdSpace";
import useWindowSize from "@src/hooks/window-size";
import { adsEnabled } from "@src/utils/env-tools";
import React from "react";

interface AdSpaceFloatingProps {
    name: string;
    unitType: UnitType;
    fromBreakpoint?: Breakpoint;
    untilBreakpoint?: Breakpoint;
    left?: number;
    right?: number;
    top?: number;
    bottom?: number;
}

const AdSpaceFloating: React.FC<AdSpaceFloatingProps> = ({
    name,
    unitType,
    fromBreakpoint,
    untilBreakpoint,
    left,
    right,
    top,
    bottom,
}) => {
    const theme = useTheme();
    const { width } = useWindowSize();

    if (!adsEnabled && !DB_DISPLAY_AD_PLACEHOLDERS) {
        return null;
    }

    const canRenderUsingFromRule = fromBreakpoint ? width >= theme.breakpoints.values[fromBreakpoint] : true;
    const canRenderUsingUntilRule = untilBreakpoint ? width <= theme.breakpoints.values[untilBreakpoint] : true;

    if (!canRenderUsingFromRule || !canRenderUsingUntilRule) {
        return null;
    }

    return (
        <Box
            sx={{
                bottom,
                display: "flex",
                justifyContent: "center",
                left,
                pointerEvents: "none",
                position: "fixed",
                right,
                top,
                zIndex: 99999,
            }}
        >
            <AdSpace
                name={name}
                unitType={unitType}
            />
        </Box>
    );
};

export default AdSpaceFloating;
