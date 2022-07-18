import { Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField } from "@mui/material";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";

interface InputDialogProps {
    title?: string;
    label?: string;
    defaultInput?: string;
    multiline?: boolean;
    open: boolean;
    onClose: () => void;
    onConfirm?: (input: string) => void;
}

const InputDialog: React.FC<InputDialogProps> = ({
    title,
    label,
    defaultInput,
    multiline,
    open,
    onClose,
    onConfirm,
}) => {
    const { t } = useTranslation();

    defaultInput ??= "";

    const [input, setInput] = useState<string>(defaultInput);

    return (
        <Dialog
            fullWidth
            maxWidth="sm"
            onClose={onClose}
            open={open}
        >
            <DialogTitle>{title}</DialogTitle>
            <DialogContent>
                <TextField
                    autoFocus
                    fullWidth
                    label={label}
                    margin="dense"
                    multiline={multiline}
                    onChange={ev => setInput(ev.target.value)}
                    value={input}
                    variant="standard"
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>{t("terms.cancel")}</Button>
                <Button
                    onClick={() => {
                        if (onConfirm) {
                            onConfirm(input);
                        }
                        setInput(defaultInput ?? "");
                    }}
                >
                    {t("terms.save")}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default InputDialog;
