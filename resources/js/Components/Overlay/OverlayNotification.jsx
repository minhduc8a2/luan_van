import React from "react";
import Overlay from "./Overlay";
import Button from "@/Components/Button";
import { useState } from "react";
import OverlayPanel from "./OverlayPanel";
export default function OverlayNotification({
    title = "Notifications",
    children,
    sameButtonRow,
    buttonNode,
    submitButtonNode,
    success,
    className=""
}) {
    return (
        <OverlayPanel buttonNode={buttonNode} success={success}>
            {({ close }) => (
                <div className="  rounded-lg bg-background">
                    <div className={`w-[500px] ${className}  m-4 `}>
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

                                <div className="flex gap-x-4">
                                    <Button onClick={close}>Close</Button>
                                    {submitButtonNode}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </OverlayPanel>
    );
}
