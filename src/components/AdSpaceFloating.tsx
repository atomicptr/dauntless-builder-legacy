import { Box, useTheme } from "@mui/material";
import AdSpace from "@src/components/AdSpace";
import useIsMobile from "@src/hooks/is-mobile";

const AdSpaceFloating = () => {
    const isMobile = useIsMobile();
    const theme = useTheme();

    if (!isMobile) {
        return null;
    }

    return (
        <Box
            sx={{
                background: theme.palette.background.default,
                bottom: 0,
                display: "flex",
                height: "64px",
                left: 0,
                position: "fixed",
                right: 0,
            }}
        >
            <AdSpace />
        </Box>
    );
};

export default AdSpaceFloating;
