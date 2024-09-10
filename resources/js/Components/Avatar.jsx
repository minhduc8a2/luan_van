import React from "react";

export default function Avatar({
    src="/images/default_avatar.png",
    className = "",
    isOnline,
    onlineClassName = "",
    offlineClassName = "",
    noStatus = false,
    roundedClassName = "rounded-lg",
}) {
    return (
        <div className={"relative  " + className}>
            <img
                src={src}
                className={`${roundedClassName} w-full h-full object-cover absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 `}
            />
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
