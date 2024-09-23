import React from "react";
import Button from "../Button";
import Overlay from "./Overlay";

export default function OverlaySimpleNotification({ show, onClose, children }) {
    return (
        <Overlay show={show} onClose={onClose}>
            <div className="p-6 bg-background rounded-lg min-w-[500px] border border-white/15">
                <h3 className="font-bold text-white/85 text-2xl">Notifications</h3>

                <div className="mt-4">{children}</div>
                <div className="flex justify-end mt-8">
                    <Button onClick={onClose}>Close</Button>
                </div>
            </div>
        </Overlay>
    );
}
