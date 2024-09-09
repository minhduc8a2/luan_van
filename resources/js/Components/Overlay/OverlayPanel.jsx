import React from "react";
import { useState, useEffect } from "react";
import Overlay from "./Overlay";
export default function OverlayPanel({
    children,
    buttonNode,
    className="",
    success = false,
}) {
    const [openOverlay, setOpenOverlay] = useState(false);
    useEffect(() => {
        if (success) setOpenOverlay(false);
    }, [success]);
    function close() {
        setOpenOverlay(false);
    }
    return (
        <div className="">
            <div
                onClick={() => {
                    setOpenOverlay(true);
                    console.log("open");
                }}
                className="w-full cursor-pointer"
            >
                {buttonNode}
            </div>
            <Overlay
                show={openOverlay}
                onClose={() => {
                    setOpenOverlay(false);
                    console.log("close");
                }}
            >
                <div className={" text-white p-4  rounded-lg bg-background "+className}>
                    {typeof children === "function"
                        ? children({ close })
                        : children}
                </div>
            </Overlay>
        </div>
    );
}
