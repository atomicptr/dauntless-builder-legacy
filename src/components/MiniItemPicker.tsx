import { Box, Card, CardActionArea, CardContent, CardMedia } from "@mui/material";
import { GenericItem } from "@src/components/GenericItemSelectDialog";
import { ItemType, itemTypeIcon, itemTypeLocalizationIdentifier } from "@src/data/ItemType";
import React from "react";
import { useTranslation } from "react-i18next";

interface MiniItemPickerProps {
    itemType: ItemType;
    value?: GenericItem | null;
    onClick?: (itemType: ItemType) => void;
}

const imageSize = 32;

const MiniItemPicker: React.FC<MiniItemPickerProps> = ({ itemType, value, onClick }) => {
    const { t } = useTranslation();

    return (
        <Card>
            <CardActionArea
                onClick={() => (onClick ? onClick(itemType) : undefined)}
                sx={{ display: "flex", height: "100%", justifyContent: "flex-start", p: 1 }}
            >
                <Box sx={{ alignItems: "center", display: "flex", justifyContent: "center" }}>
                    <CardMedia
                        component={"img"}
                        image={value ? value.icon : itemTypeIcon(itemType)}
                        sx={{ height: imageSize, width: imageSize }}
                    />
                </Box>
                <CardContent>{value ? value.name : t(itemTypeLocalizationIdentifier(itemType))}</CardContent>
            </CardActionArea>
        </Card>
    );
};

export default React.memo(MiniItemPicker);
