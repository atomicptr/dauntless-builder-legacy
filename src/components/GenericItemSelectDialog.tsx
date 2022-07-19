import { Close, Search } from "@mui/icons-material";
import {
    AppBar,
    Box,
    Button,
    Card,
    CardActionArea,
    CardContent,
    CardMedia,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    IconButton,
    InputAdornment,
    ListItem,
    TextField,
    Toolbar,
    Typography,
} from "@mui/material";
import { DialogTransition } from "@src/components/DialogTransition";
import { itemPickerDefaultImageSize } from "@src/components/theme";
import VirtualizedList from "@src/components/VirtualizedList";
import { ItemType } from "@src/data/ItemType";
import useIsMobile from "@src/hooks/is-mobile";
import React, { ReactNode, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

export interface GenericItem {
    name: string;
    icon?: string;
}

interface GenericItemSelectDialogProps {
    open: boolean;
    title: string;
    itemType: ItemType;
    items: GenericItem[];
    onItemSelected: (item: GenericItem | null) => void;
    handleClose: () => void;
    componentsInside?: (item: GenericItem, itemType: ItemType) => ReactNode;
}

const imageSize = itemPickerDefaultImageSize;
const dialogWidth = "md";

const GenericItemSelectDialog: React.FC<GenericItemSelectDialogProps> = ({
    open,
    items,
    title,
    itemType,
    onItemSelected,
    handleClose,
    componentsInside,
}) => {
    const { t } = useTranslation();
    const isMobile = useIsMobile();

    const searchFieldRef = useRef<HTMLElement>(null);
    const [searchValue, setSearchValue] = useState<string>("");

    const filteredItems = useMemo(
        () => items.filter(item => item.name.toLowerCase().indexOf(searchValue.toLowerCase()) > -1),
        [items, searchValue],
    );

    // reset filter values whenever open state changes
    useEffect(() => {
        setSearchValue("");
    }, [open]);

    return (
        <Dialog
            TransitionComponent={DialogTransition}
            fullScreen={isMobile}
            fullWidth
            maxWidth={dialogWidth}
            onClose={handleClose}
            open={open}
        >
            {isMobile ? (
                <AppBar sx={{ position: "relative" }}>
                    <Toolbar>
                        <Typography
                            component="div"
                            sx={{ flex: 1, ml: 2, userSelect: "none" }}
                            variant="h6"
                        >
                            {title}
                        </Typography>
                        <IconButton
                            aria-label="close"
                            color="inherit"
                            edge="start"
                            onClick={handleClose}
                        >
                            <Close />
                        </IconButton>
                    </Toolbar>
                </AppBar>
            ) : (
                <DialogTitle>{title}</DialogTitle>
            )}

            <DialogContent sx={{ minHeight: "80vh", overflow: "hidden" }}>
                <Box
                    ref={searchFieldRef}
                    sx={{ m: 1 }}
                >
                    <TextField
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <Search />
                                </InputAdornment>
                            ),
                        }}
                        fullWidth
                        onChange={ev => setSearchValue(ev.target.value)}
                        placeholder={t("terms.search")}
                        value={searchValue}
                        variant="standard"
                    />
                </Box>

                <VirtualizedList
                    count={filteredItems.length + 1}
                    defaultRowHeight={165}
                    renderItems={(rowRef, index, style) => {
                        const item = filteredItems[index];

                        // TODO: Don't know why in some circumstances the list gets cut off, a simple fix is just adding an extra item i guess...
                        if (!item) {
                            return null;
                        }

                        return (
                            <ListItem
                                key={index}
                                component={"div"}
                                disablePadding
                                style={style}
                                sx={{ width: "100%" }}
                            >
                                <Box
                                    ref={rowRef}
                                    sx={{ width: "100%" }}
                                >
                                    <Card sx={{ mb: 1, width: "100%" }}>
                                        <CardActionArea
                                            onClick={() => onItemSelected(item)}
                                            sx={{ height: "100%" }}
                                        >
                                            <Box
                                                sx={{
                                                    alignItems: "center",
                                                    display: "flex",
                                                    flexDirection: "row",
                                                    height: "100%",
                                                    justifyContent: "flex-start",
                                                    width: "100%",
                                                }}
                                            >
                                                <Box
                                                    sx={{
                                                        alignItems: "center",
                                                        display: "flex",
                                                        justifyContent: "center",
                                                        pl: 2,
                                                        pr: 2,
                                                    }}
                                                >
                                                    <CardMedia
                                                        component="img"
                                                        image={item.icon ?? "/assets/noicon.png"}
                                                        sx={{ height: imageSize, width: imageSize }}
                                                    />
                                                </Box>
                                                <CardContent>
                                                    {componentsInside ? componentsInside(item, itemType) : null}
                                                </CardContent>
                                            </Box>
                                        </CardActionArea>
                                    </Card>
                                </Box>
                            </ListItem>
                        );
                    }}
                    subtractFromHeight={searchFieldRef.current?.clientHeight ?? 0}
                />
            </DialogContent>

            <DialogActions>
                <Button onClick={() => onItemSelected(null)}>{t("terms.unselect")}</Button>
                <Button onClick={handleClose}>{t("terms.close")}</Button>
            </DialogActions>
        </Dialog>
    );
};

export default GenericItemSelectDialog;
