import React from "react";
import Overlay from "./Overlay";
import Button from "@/Components/Button";
import { useState } from "react";
export default function OverlayNotification({
    title = "Notifications",
    children,
    sameButtonRow,
    buttonName = "Close",
    show = false,
    close = () => {},
}) {
    return (
        <Overlay
            show={show}
            onClose={() => {
                close();
            }}
        >
            <div className=" text-white  p-4 rounded-lg bg-background">
                <div className="w-[500px] max-w-screen-sm m-4 ">
                    <h2 className="text-2xl my-4 font-bold text-white/85">
                        {title}
                    </h2>
                    <div className="mt-8">
                        {children}
                        <div
                            className={`mt-4 flex  ${
                                sameButtonRow
                                    ? "justify-between"
                                    : "justify-end"
                            }`}
                        >
                            {sameButtonRow}
                            <Button
                                className="text-white/65"
                                onClick={() => {
                                    close();
                                }}
                            >
                                {buttonName}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </Overlay>
    );
}
