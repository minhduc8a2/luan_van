import CustomedDialog from "@/Components/CustomedDialog";
import React from "react";

export default function RemoveFromWorkspace({isOpen, onClose}) {
    return (
        <CustomedDialog
            isOpen={isOpen}
            onClose={onClose}

        ></CustomedDialog>
    );
}
