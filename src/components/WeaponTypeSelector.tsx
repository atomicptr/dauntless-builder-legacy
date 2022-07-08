import { Box, Card, CardActionArea, CardContent, CardMedia, Grid } from "@mui/material";
import { WeaponType } from "@src/data/Weapon";
import React from "react";
import { useTranslation } from "react-i18next";

interface WeaponTypeSelectorProps {
    value?: WeaponType | null;
    onChange?: (weaponType: WeaponType) => void;
}

const imageSize = 32;

const WeaponTypeSelector: React.FC<WeaponTypeSelectorProps> = ({ value, onChange }) => {
    const { t } = useTranslation();

    const isSelected = (weaponType: WeaponType) => value === weaponType;

    return (
        <Grid
            container
            spacing={1}
        >
            {Object.keys(WeaponType).map(weaponType => (
                <Grid
                    key={weaponType}
                    item
                >
                    <Card elevation={isSelected(WeaponType[weaponType as keyof typeof WeaponType]) ? 5 : 1}>
                        <CardActionArea
                            disabled={isSelected(WeaponType[weaponType as keyof typeof WeaponType])}
                            onClick={() =>
                                onChange ? onChange(WeaponType[weaponType as keyof typeof WeaponType]) : undefined
                            }
                            sx={{ display: "flex", height: "100%", justifyContent: "flex-start", p: 1 }}
                        >
                            <Box sx={{ alignItems: "center", display: "flex", justifyContent: "center" }}>
                                <CardMedia
                                    component={"img"}
                                    image={`/assets/icons/generic/${weaponType}.png`}
                                    sx={{ height: imageSize, width: imageSize }}
                                />
                            </Box>
                            <CardContent>{t(`terms.weapon-types.${weaponType}`)}</CardContent>
                        </CardActionArea>
                    </Card>
                </Grid>
            ))}
        </Grid>
    );
};

export default WeaponTypeSelector;
