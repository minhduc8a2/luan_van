import Overlay from "@/Components/Overlay/Overlay";
import React from "react";
import Button from "../Button";

export default function OverlayConfirm({
    show,
    onClose,
    onConfirm,
    title,
    message,
}) {
    return (
        <Overlay show={show} onClose={onClose}>
            <div className="p-6 bg-background rounded-lg min-w-[500px] border border-white/15">
                <h3 className="font-bold text-white/85 text-2xl">{title}</h3>

                <div className="mt-4">{message}</div>
                <div className="flex justify-end mt-8 gap-x-4">
                    <Button onClick={onClose}>Close</Button>
                    <Button onClick={onConfirm} className="!bg-danger-500">Yes, Delete this file</Button>
                </div>
            </div>
        </Overlay>
    );
}
