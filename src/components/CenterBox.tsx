import { Box } from "@mui/material";
import React from "react";

interface CenterBoxProps {
    flexGrow?: number;
    children: React.ReactElement;
}

const CenterBox: React.FC<CenterBoxProps> = ({ flexGrow, children }) => (
    <Box
        sx={{
            alignItems: "center",
            display: "flex",
            flexGrow,
            justifyContent: "center",
        }}
    >
        {children}
    </Box>
);

export default React.memo(CenterBox);
