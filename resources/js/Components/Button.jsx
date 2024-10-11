import React from "react";
import OverlayLoadingSpinner from "@/Components/Overlay/OverlayLoadingSpinner";

export default function Button({
    className = "",
    type = "",
    loading = false,
    disabled = false,
    children,
    ...props
}) {
    switch (type) {
        case "danger":
            type = "bg-danger-500 text-white hover:bg-danger-400";
            break;
        case "danger-text":
            type =
                "bg-transparent text-danger-500 hover:bg-danger-500 hover:text-white";
            break;
        case "green":
            type = "bg-dark-green text-white hover:bg-dark-green/85";
            break;
        default:
            type = "bg-foreground text-white/85";
            break;
    }
    return (
        <div
            {...props}
            className={
                ` rounded-lg font-semibold border flex items-center justify-center border-white/15 relative  transition  py-2 px-3 ${type}  ${
                    disabled
                        ? "cursor-default  opacity-50"
                        : "cursor-pointer hover:bg-white/10 hover:text-white"
                } ` + className
            }
        >
            {loading && <OverlayLoadingSpinner />}
            <div className={loading ? "opacity-0" : ""}>{children}</div>
        </div>
    );
}
