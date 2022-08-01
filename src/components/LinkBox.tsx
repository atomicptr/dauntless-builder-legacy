import { Box } from "@mui/material";
import useIsLightMode from "@src/hooks/light-mode";
import React from "react";

interface LinkBoxProps {
    text: string;
}

const LinkBox: React.FC<LinkBoxProps> = ({ text }) => {
    const isLightMode = useIsLightMode();
    return (
        <Box
            dangerouslySetInnerHTML={{ __html: text }}
            sx={{
                a: {
                    color: isLightMode ? "black !important" : "white !important",
                },
            }}
        />
    );
};

export default LinkBox;
