import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";

import { createContext, useContext, useState } from "react";
import Button from "./Button";
const DialogContext = createContext(null);
function CustomedDialog({ children, isOpen, onClose, className = "" }) {
    return (
        <DialogContext.Provider value={{ onClose }}>
            <Dialog open={isOpen} onClose={onClose} className="relative z-50">
                <div className="fixed inset-0 flex w-screen items-center bg-black/50 justify-center p-4">
                    <DialogPanel
                        className={`w-[600px] max-w-full  bg-background p-8 rounded-lg ${className}`}
                    >
                        {children}
                    </DialogPanel>
                </div>
            </Dialog>
        </DialogContext.Provider>
    );
}

function Title({ children }) {
    return (
        <DialogTitle className="font-bold text-2xl mb-6">
            {children}
        </DialogTitle>
    );
}

function ActionButtons({
    btnName1 = "Close",
    btnName2 = "Submit",
    onClickBtn2,
    classNameBtn2,
    loading = false,
    type,
    disabled = false,
    className = ""
}) {
    const { onClose } = useContext(DialogContext);
    return (
        <div className={"flex justify-end gap-x-4 mt-8 "+className}>
            <Button onClick={onClose}>{btnName1}</Button>
            <Button
                onClick={onClickBtn2}
                loading={loading}
                className={classNameBtn2}
                type={type}
                disabled={disabled}
            >
                {btnName2}
            </Button>
        </div>
    );
}

function CloseButton() {
    const { onClose } = useContext(DialogContext);
    return (
        <div className="flex justify-end">
            <Button onClick={onClose}>Close</Button>
        </div>
    );
}

CustomedDialog.Title = Title;
CustomedDialog.ActionButtons = ActionButtons;
CustomedDialog.CloseButton = CloseButton;
export default CustomedDialog;
