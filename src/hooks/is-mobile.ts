import { useMediaQuery, useTheme } from "@mui/material";

const useIsMobile = () => {
    const theme = useTheme();
    return useMediaQuery(`(max-width: ${theme.breakpoints.values.md}px)`);
};

export default useIsMobile;
