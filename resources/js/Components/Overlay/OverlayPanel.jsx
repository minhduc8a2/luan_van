import React from "react";
import { useState, useEffect } from "react";
import Overlay from "./Overlay";
export default function OverlayPanel({
    children,
    buttonNode,

    success = false,
}) {
    const [openOverlay, setOpenOverlay] = useState(false);
    useEffect(() => {
        if (success) setOpenOverlay(false);
    }, [success]);
    return (
        <div className="">
            <button
                onClick={() => {
                    setOpenOverlay(true);
                    console.log("open");
                }}
                className="w-full"
            >
                {buttonNode}
            </button>
            <Overlay
                show={openOverlay}
                onClose={() => {
                    setOpenOverlay(false);
                    console.log("close");
                }}
            >
                <div className=" text-white  p-4 rounded-lg bg-background">
                   
                        {children}
                    
                </div>
            </Overlay>
        </div>
    );
}
