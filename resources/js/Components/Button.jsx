import React from "react";
import OverlayLoadingSpinner from "@/Components/Overlay/OverlayLoadingSpinner";

export default function Button({
    className = "",
    loading = false,
    disabled = false,
    children,
    ...props
}) {
    return (
        <div
            {...props}
            className={
                ` rounded-lg font-semibold border border-white/15 bg-foreground relative  transition text-white/85 py-2 px-3   ${
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
