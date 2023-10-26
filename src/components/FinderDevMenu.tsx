import { Box, Button, Card, CardContent, Stack, Typography } from "@mui/material";
import InputDialog from "@src/components/InputDialog";
import { BuildsContext } from "@src/pages/build/BuildFinder";
import { AssignedPerkValue, clearPerks, finderAtom, setPerkValue } from "@src/state/finder";
import log from "@src/utils/logger";
import { useAtom } from "jotai";
import React, { useContext, useState } from "react";
import { useTranslation } from "react-i18next";

const FinderDevMenu = () => {
    const { t } = useTranslation();
    const [{ selectedPerks }, setFinder] = useAtom(finderAtom);

    const [inputDialogOpen, setInputDialogOpen] = useState(false);

    const builds = useContext(BuildsContext);

    return (
        <>
            <Card>
                <CardContent>
                    <Stack spacing={1}>
                        <Typography variant="h5">{t("pages.build-finder.dev-options-title")}</Typography>
                        <Stack
                            direction="row"
                            spacing={2}
                        >
                            <Button
                                onClick={() => setInputDialogOpen(true)}
                                variant="outlined"
                            >
                                {t("pages.build-finder.dev-set-perks")}
                            </Button>
                        </Stack>
                        <Box>
                            <Typography>
                                {t("pages.build-finder.dev-number-of-perks", {
                                    num: Object.keys(selectedPerks).length,
                                })}
                            </Typography>
                            <Typography>
                                {t("pages.build-finder.dev-number-of-builds", { num: (builds ?? []).length })}
                            </Typography>
                        </Box>
                        <pre>
                            <code>{JSON.stringify(selectedPerks, null, "    ")}</code>
                        </pre>
                    </Stack>
                </CardContent>
            </Card>
            <InputDialog
                multiline
                onClose={() => setInputDialogOpen(false)}
                onConfirm={input => {
                    setFinder(clearPerks());
                    try {
                        const json = JSON.parse(input) as AssignedPerkValue;
                        for (const [perkName, value] of Object.entries(json)) {
                            setFinder(setPerkValue({ perkName, value }));
                        }
                    } catch (e) {
                        log.error("Could not set perk values", { e });
                    }
                    setInputDialogOpen(false);
                }}
                open={inputDialogOpen}
                title={t("pages.build-finder.dev-set-perks")}
            />
        </>
    );
};

export default React.memo(FinderDevMenu);
