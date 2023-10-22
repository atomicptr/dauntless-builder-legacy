import { Box, useTheme } from "@mui/material";
import AdSpace, { UnitType } from "@src/components/AdSpace";
import useIsMobile from "@src/hooks/is-mobile";
import useWindowSize from "@src/hooks/window-size";
import { adsEnabled } from "@src/utils/env-tools";
import React from "react";

export const adSpaceRightSideMinSize = 300;
export const adSpaceMobileBannerHeight = 96;

const AdSpaceFloating = () => {
    const theme = useTheme();
    const isMobile = useIsMobile();
    const { width } = useWindowSize();

    if (!adsEnabled) {
        return null;
    }

    const rightSideSpace = (width - theme.breakpoints.values.xl) * 0.5;
    const rightSideHasEnoughSpace = rightSideSpace > adSpaceRightSideMinSize;

    const baseStyle = {
        background: theme.palette.background.default,
        display: "flex",
        position: "fixed",
    };

    if (!isMobile && !rightSideHasEnoughSpace) {
        return null;
    }

    const style = {
        ...baseStyle,
        ...(isMobile
            ? {
                bottom: 0,
                height: `${adSpaceMobileBannerHeight}px`,
                left: 0,
                right: 0,
            }
            : {
                bottom: 0,
                right: 0,
                top: 64,
                width: `${rightSideSpace - adSpaceRightSideMinSize * 0.5}px`,
            }),
    };

    return (
        <Box sx={style}>
            <AdSpace unitType={isMobile ? UnitType.BottomRail : UnitType.RightRail} />
        </Box>
    );
};

export default AdSpaceFloating;
