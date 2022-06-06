import { Button, Stack } from "@mui/material";
import PageTitle from "@src/components/page-title/PageTitle";
import React from "react";
import { useTranslation } from "react-i18next";
import { NavLink } from "react-router-dom";

const Home: React.FC = () => {
    const { t } = useTranslation();

    return (
        <>
            <PageTitle title={t("pages.home.title")} />

            <Stack
                direction="column"
                spacing={2}
                sx={{ mt: 2 }}
            >
                <Button
                    component={NavLink}
                    to={"/b/0VfrT2mCZCkBHjhjcjUaTVTvETbC8zH0RToCggUAVtVCRtjot6CndsmfxXTe"}
                    variant="outlined"
                >
                    {"Test Build #1 - Iceborne / Glyph Weaver Spear"}
                </Button>

                <Button
                    component={NavLink}
                    to={"/b/LWfOTy0uzCzTdTZTvTQT5TzpIMCrbUgWcdCeyCngHMCKtBRt2CZKFkfzgsw"}
                    variant="outlined"
                >
                    {"Test Build #2 - Artificer / Twin Suns"}
                </Button>

                <Button
                    component={NavLink}
                    to={"/b/Brf8TNQi3C1yfjqUViOhjIWOsJaFkCdBU71SVC6KFgtJCL8UjxtOCjwuEu2Oc3"}
                    variant="outlined"
                >
                    {"Test Build #3 - Discipline / Tainted Needles"}
                </Button>

                <Button
                    component={NavLink}
                    to={"/b/EQfPT2fNC0VFQ5frFgu6T5ToeIJC3EIOkfoC03SZrTbCmZHBquBCj0sLSonUE"}
                    variant="outlined"
                >
                    {"Test Build #4 - Revenant / Charred Blades"}
                </Button>
            </Stack>
        </>
    );
};

export default Home;
