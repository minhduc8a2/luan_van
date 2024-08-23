import React from "react";

export default function Avatar({
    src,
    className = "",
    isOnline,
    onlineClassName = "",
    offlineClassName = "",
    noStatus = false,
}) {
    return (
        <div className="relative w-fit">
            <img src={src} className={`rounded-lg w-10 h-10 ${className}`} />
            {noStatus ? (
                ""
            ) : isOnline ? (
                <div
                    className={
                        "absolute -bottom-1 -right-1 h-3 w-3 rounded-full bg-green-600  border-2 border-primary " +
                        onlineClassName
                    }
                ></div>
            ) : (
                <div
                    className={
                        "absolute -bottom-1 -right-1 h-3 w-3 rounded-full   border-2 border-white/75 bg-primary " +
                        offlineClassName
                    }
                ></div>
            )}
        </div>
    );
}
