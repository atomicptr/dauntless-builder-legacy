import { Typography } from "@mui/material";
import React from "react";
import { Helmet } from "react-helmet";

interface PageTitleProps {
    title: string;
    hidden?: boolean;
}

const PageTitle: React.FC<PageTitleProps> = ({ title, hidden }) => (
    <>
        <Helmet>
            <title>{title} | Dauntless Builder</title>
        </Helmet>

        {!hidden ? (
            <Typography variant="h4" component="h1">
                {title}
            </Typography>
        ) : null}
    </>
);

export default PageTitle;
