import React from "react";
import OverlayLoadingSpinner from "@/Components/Overlay/OverlayLoadingSpinner";

export default function Button({
    className = "",
    loading = false,
    children,
    ...props
}) {
    return (
        <div
            {...props}
            className={
                " rounded-xl cursor-pointer bg-foreground relative hover:bg-white/10 transition text-white/85 py-2 px-4 hover:text-white " +
                className
            }
        >
            {loading && <OverlayLoadingSpinner />}
            <div className={loading ? "opacity-0" : ""}>{children}</div>
        </div>
    );
}
