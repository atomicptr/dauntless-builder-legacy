import { FeaturedVideo } from "@mui/icons-material";
import { Box, useTheme } from "@mui/material";

const AdSpace = () => {
    const theme = useTheme();

    if (!DB_ENABLE_ADS) {
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

    return null;
};

export default AdSpace;
