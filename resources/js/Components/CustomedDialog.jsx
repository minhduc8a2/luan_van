import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";

import { useState } from "react";
function CustomedDialog({ children,isOpen,onClose,  className = "" }) {
  

    return (
        <>
            
            <Dialog
                open={isOpen}
                onClose={onClose}
                className="relative z-50"
            >
                <div className="fixed inset-0 flex w-screen items-center bg-black/50 justify-center p-4">
                    <DialogPanel
                        className={`w-[45vw]   bg-background p-8 rounded-lg ${className}`}
                    >
                        {children}
                    </DialogPanel>
                </div>
            </Dialog>
        </>
    );
}

function Title({ children }) {
    return (
        <DialogTitle className="font-bold text-2xl mb-6">
            {children}
        </DialogTitle>
    );
}

CustomedDialog.Title = Title;
export default CustomedDialog;
