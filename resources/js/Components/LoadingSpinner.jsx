import React from "react";

export default function LoadingSpinner({ spinerStyle = "" }) {
    return (
        <div className="absolute z-20 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
            <div
                className={` border-2 border-b-transparent border-color h-4 w-4 animate-spin rounded-full ${spinerStyle}`}
            ></div>
        </div>
    );
}
