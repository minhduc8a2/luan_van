import React, { forwardRef } from "react";

const StreamVideo = forwardRef(function (
    { size = "w-48 h-48", className = "", ...props },
    ref
) {
    return (
        <div
            className={`${size} rounded-lg  overflow-hidden relative ${className}`}
        >
            <video
                ref={ref}
                {...props}
                className="object-cover w-full h-full absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
            ></video>
        </div>
    );
});
export default StreamVideo;
