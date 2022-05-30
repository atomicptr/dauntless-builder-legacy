import { Button, Stack } from "@mui/material";
import React from "react";
import { useTranslation } from "react-i18next";
import { NavLink } from "react-router-dom";

import PageTitle from "../../components/page-title/PageTitle";

const Home: React.FC = () => {
    const { t } = useTranslation();

    return (
        <>
            <PageTitle title={t("pages.home.title")} />

            <Stack
                direction="column"
                spacing={2}
                sx={{ mt: 2 }}>
                <Button
                    component={NavLink}
                    variant="outlined"
                    to={"/b/XafXTkTpTQT8TbTMT5TeTxTmTdTJTwT2T7T2T1TyT8TQTrTpT3"}>
                    Empty Build
                </Button>

                <Button
                    component={NavLink}
                    variant="outlined"
                    to={"/b/0VfrT2mCZCkBHjhjcjUaTVTvETbC8zH0RToCggUAVtVCRtjot6CndsmfxXTe"}>
                    Test Build #1 - Iceborne / Glyph Weaver Spear
                </Button>

                <Button
                    component={NavLink}
                    variant="outlined"
                    to={"/b/LWfOTy0uzCzTdTZTvTQT5TzpIMCrbUgWcdCeyCngHMCKtBRt2CZKFkfzgsw"}>
                    Test Build #2 - Artificer / Twin Suns
                </Button>

                <Button
                    component={NavLink}
                    variant="outlined"
                    to={"/b/Brf8TNQi3C1yfjqUViOhjIWOsJaFkCdBU71SVC6KFgtJCL8UjxtOCjwuEu2Oc3"}>
                    Test Build #3 - Discipline / Tainted Needles
                </Button>
            </Stack>
        </>
    );
};

export default Home;
