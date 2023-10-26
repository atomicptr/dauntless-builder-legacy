import { Box, Skeleton, Typography } from "@mui/material";
import BuildCard from "@src/components/BuildCard";
import { buildDisplayLimit, BuildsContext } from "@src/pages/build/BuildFinder";
import React, { useContext } from "react";
import { useTranslation } from "react-i18next";
import { LazyLoadComponent } from "react-lazy-load-image-component";

const FinderBuildList = () => {
    const { t } = useTranslation();
    const builds = useContext(BuildsContext);

    return (
        <>
            <Typography variant="h5">
                {t("pages.build-finder.builds-title", {
                    num: Math.min((builds ?? []).length, buildDisplayLimit),
                })}
            </Typography>
            {(builds ?? []).slice(0, buildDisplayLimit).map((build, index) => (
                <Box key={index}>
                    <LazyLoadComponent
                        placeholder={
                            <Skeleton
                                height={300}
                                variant={"rectangular"}
                                width="100%"
                            />
                        }
                    >
                        <Box>
                            <BuildCard build={build} />
                        </Box>
                    </LazyLoadComponent>
                </Box>
            ))}
        </>
    );
};

export default React.memo(FinderBuildList);
