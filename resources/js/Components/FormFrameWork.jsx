import React from "react";
import { useState } from "react";
import Overlay from "./Overlay";
export default function FormFrameWork({ children, buttonNode, submit }) {
    const [openOverlay, setOpenOverlay] = useState(false);
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
                    <form action="" onSubmit={submit}>{children}</form>
                </div>
            </Overlay>
        </div>
    );
}
