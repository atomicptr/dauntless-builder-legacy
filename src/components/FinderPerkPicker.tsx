import { Clear } from "@mui/icons-material";
import {
    Box,
    Button,
    Card,
    CardActionArea,
    CardContent,
    Grid,
    IconButton,
    InputAdornment,
    OutlinedInput,
    Stack,
    Tooltip,
    Typography,
} from "@mui/material";
import PerkTooltip from "@src/components/PerkTooltip";
import RarityCard from "@src/components/RarityCard";
import { ItemRarity } from "@src/data/ItemRarity";
import { ItemType } from "@src/data/ItemType";
import { Perk } from "@src/data/Perks";
import useIsMobile from "@src/hooks/is-mobile";
import useIsLightMode from "@src/hooks/light-mode";
import { perks } from "@src/pages/build/find-builds";
import { clearPerks, finderAtom, setPerkValue } from "@src/state/finder";
import { itemTranslationIdentifier } from "@src/utils/item-translation-identifier";
import { matchesSearchIn } from "@src/utils/search";
import { useAtom } from "jotai";
import React, { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import { BiMinus } from "react-icons/bi";

interface FinderPerkPickerProps {
    disabled: boolean;
    canAddPerk: (perk: Perk) => boolean;
}

const FinderPerkPicker: React.FC<FinderPerkPickerProps> = ({ disabled, canAddPerk }) => {
    const { t } = useTranslation();
    const isMobile = useIsMobile();
    const isLightMode = useIsLightMode();

    const [perkSearch, setPerkSearch] = useState("");

    const [{ selectedPerks }, setFinder] = useAtom(finderAtom);

    const renderToolTip = useCallback(
        (perk: Perk, count: number) => (
            <PerkTooltip
                count={count}
                filterLevels={["3", "6"]}
                perk={perk}
                withDescription
            />
        ),
        [],
    );

    const canRenderPerk = useCallback(
        (perk: Perk) =>
            matchesSearchIn(perkSearch, [perk.name, t(itemTranslationIdentifier(ItemType.Perk, perk.name, "name"))]),
        [perkSearch, t],
    );

    const onPerkClicked = (perk: Perk) => {
        const value = perk.name in selectedPerks ? selectedPerks[perk.name] + 3 : 3;
        setFinder(setPerkValue({ perkName: perk.name, value }));
    };

    const renderPerkLevel = useCallback(
        (perk: Perk) => {
            if (!(perk.name in selectedPerks)) {
                return null;
            }
            return `+${selectedPerks[perk.name]}`;
        },
        [selectedPerks],
    );

    return (
        <>
            <Stack
                direction={isMobile ? "column" : "row"}
                spacing={isMobile ? 2 : undefined}
            >
                <Typography variant="h5">{t("pages.build-finder.perks-title")}</Typography>
                {!isMobile && <Box sx={{ flexGrow: 2 }} />}
                <Button
                    onClick={() => {
                        setFinder(clearPerks());
                        setPerkSearch("");
                    }}
                    startIcon={<Clear />}
                    variant={isMobile ? "outlined" : undefined}
                >
                    {t("pages.build-finder.clear-perks")}
                </Button>
            </Stack>

            <OutlinedInput
                endAdornment={
                    perkSearch.length > 0 ? (
                        <InputAdornment position="end">
                            <IconButton onClick={() => setPerkSearch("")}>
                                <Clear />
                            </IconButton>
                        </InputAdornment>
                    ) : undefined
                }
                onChange={ev => setPerkSearch(ev.target.value)}
                placeholder={t("pages.build-finder.filter-perks")}
                value={perkSearch}
            />

            <Grid
                container
                gap={1}
            >
                {Object.keys(perks).map(cellType => (
                    <Grid
                        key={cellType}
                        item
                        sx={{ flexGrow: 1 }}
                        xs={isMobile ? 12 : undefined}
                    >
                        <Stack spacing={1}>
                            {(isMobile
                                ? perks[cellType as keyof typeof perks].filter(canRenderPerk).length > 0
                                : true) && (
                                <Stack
                                    spacing={1}
                                    sx={{ alignItems: "center", my: 2 }}
                                >
                                    <img
                                        src={`/assets/icons/perks/${cellType}.png`}
                                        style={{
                                            filter: isLightMode ? "invert(100%)" : undefined,
                                            height: "64px",
                                            width: "64px",
                                        }}
                                    />
                                    <Typography>{t(`terms.cell-type.${cellType}`)}</Typography>
                                </Stack>
                            )}

                            {perks[cellType as keyof typeof perks].map(
                                (perk: Perk) =>
                                    canRenderPerk(perk) && (
                                        <Stack
                                            key={perk.name}
                                            direction="row"
                                            spacing={1}
                                        >
                                            <Tooltip
                                                arrow
                                                disableFocusListener={isMobile}
                                                disableHoverListener={isMobile}
                                                disableTouchListener={isMobile}
                                                followCursor
                                                title={renderToolTip(perk, selectedPerks[perk.name] ?? 0)}
                                            >
                                                <RarityCard
                                                    disabled={!canAddPerk(perk)}
                                                    elevation={canAddPerk(perk) ? 1 : 0}
                                                    rarity={
                                                        selectedPerks[perk.name] === 6
                                                            ? ItemRarity.Epic
                                                            : selectedPerks[perk.name] === 3
                                                                ? ItemRarity.Uncommon
                                                                : undefined
                                                    }
                                                    sx={{ flexGrow: 2 }}
                                                >
                                                    <CardActionArea
                                                        disabled={!canAddPerk(perk)}
                                                        onClick={() => onPerkClicked(perk)}
                                                    >
                                                        <CardContent>
                                                            <Box sx={{ fontSize: isMobile ? "1rem" : undefined }}>
                                                                {t(
                                                                    itemTranslationIdentifier(
                                                                        ItemType.Perk,
                                                                        perk.name,
                                                                        "name",
                                                                    ),
                                                                )}
                                                                {" "}
                                                                {renderPerkLevel(perk)}
                                                            </Box>
                                                            <Box hidden={!isMobile}>
                                                                {t(
                                                                    itemTranslationIdentifier(
                                                                        ItemType.Perk,
                                                                        perk.name,
                                                                        "description",
                                                                    ),
                                                                )}
                                                            </Box>
                                                        </CardContent>
                                                    </CardActionArea>
                                                </RarityCard>
                                            </Tooltip>

                                            {perk.name in selectedPerks && (
                                                <Card sx={{ width: "50px" }}>
                                                    <CardActionArea
                                                        disabled={disabled}
                                                        onClick={() =>
                                                            setFinder(
                                                                setPerkValue({
                                                                    perkName: perk.name,
                                                                    value: Math.max(0, selectedPerks[perk.name] - 3),
                                                                }),
                                                            )
                                                        }
                                                        sx={{
                                                            alignItems: "center",
                                                            display: "flex",
                                                            height: "100%",
                                                            justifyContent: "center",
                                                            width: "100%",
                                                        }}
                                                    >
                                                        <Box>
                                                            <BiMinus />
                                                        </Box>
                                                    </CardActionArea>
                                                </Card>
                                            )}
                                        </Stack>
                                    ),
                            )}
                        </Stack>
                    </Grid>
                ))}
            </Grid>
        </>
    );
};

export default React.memo(FinderPerkPicker);
