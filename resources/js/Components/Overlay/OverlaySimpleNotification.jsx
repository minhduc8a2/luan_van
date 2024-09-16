import React from "react";
import Button from "../Button";
import Overlay from "./Overlay";

export default function OverlaySimpleNotification({ show, onClose, children }) {
    return (
        <Overlay show={show} onClose={onClose}>
            <div className="p-6 bg-background rounded-lg min-w-96 border border-white/15">
                <h3 className="font-bold text-2xl">Notifications</h3>
                <div className="mt-4">

                {children}
                </div>
                <div className="flex justify-end mt-4">
                    <Button onClick={onClose}>Close</Button>
                </div>
            </div>
        </Overlay>
    );
}
