import React from "react";
import { useState } from "react";
import OverlayLoadingSpinner from "./Overlay/OverlayLoadingSpinner";
export default function Video({
    className = "",
    loadingClassname = "aspect-[4/5] bg-black",
    ...props
}) {
    const [loaded, setLoaded] = useState(false);
    return (
        <div
            className={`relative flex justify-center ${
                !loaded ? loadingClassname : ""
            } ${className}`}
        >
            {!loaded && <OverlayLoadingSpinner />}
            <video
                className={`h-full rounded-lg ${loaded ? "" : "hidden"} `}
                {...props}
                onCanPlayThrough={(e) => {
                    setLoaded(true);
                }}
            />
        </div>
    );
}
