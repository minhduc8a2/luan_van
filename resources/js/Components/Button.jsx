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
            type = "bg-danger-500 text-color hover:bg-danger-400";
            break;
        case "danger-text":
            type =
                "bg-transparent text-danger-500 hover:bg-danger-500 hover:text-color";
            break;
        case "green":
            type = "bg-dark-green text-color hover:bg-dark-green/85";
            break;
        default:
            type = "bg-color/10 text-color/85";
            break;
    }
    return (
        <div
            {...props}
            className={
                ` rounded-lg font-semibold border flex items-center justify-center border-color/15 relative  transition  py-2 px-3 ${type}  ${
                    disabled
                        ? "cursor-default  opacity-50"
                        : "cursor-pointer hover:bg-color/5 hover:text-color"
                } ` + className
            }
        >
            {loading && <LoadingSpinner />}
            <div className={loading ? "opacity-0" : ""}>{children}</div>
        </div>
    );
}
