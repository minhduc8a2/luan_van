import React from "react";
import LoadingSpinner from "@/Components/LoadingSpinner";

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
                "bg-transparent text-danger-500 hover:bg-danger-500 hover:text-color";
            break;
        case "green":
            type = "bg-dark-green text-white hover:bg-dark-green/85";
            break;
        default:
            type = "bg-color/10 text-color-high-emphasis hover:bg-color/5";
            break;
    }
    return (
        <div
            role="button"
            {...props}
            className={
                ` rounded-lg font-semibold border flex items-center justify-center border-color/15 relative  transition  py-2 px-3 ${type}  ${
                    (disabled || loading) ? "cursor-default  opacity-50" : "cursor-pointer  "
                } ` + className
            }
        >
            {loading && <LoadingSpinner />}
            <div className={loading ? "opacity-0" : ""}>{children}</div>
        </div>
    );
}
