import { usePage } from "@inertiajs/react";
import React, { memo } from "react";

const Avatar = memo(function ({
    src = "",
    className = "",
    isOnline,
    onlineClassName = "",
    offlineClassName = "",
    noStatus = false,
    roundedClassName = "rounded-lg ",
}) {
    const { default_avatar_url } = usePage().props;
    return (
        <div className={"relative  " + className}>
            <img
                src={src || default_avatar_url}
                className={`${roundedClassName} w-full h-full object-cover absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 `}
            />
            {noStatus ? (
                ""
            ) : isOnline ? (
                <div
                    className={
                        "absolute -bottom-1 -right-1 h-3 w-3 rounded-full bg-green-600  border-2 border-primary-500 " +
                        onlineClassName
                    }
                ></div>
            ) : (
                <div
                    className={
                        "absolute -bottom-1 -right-1 h-3 w-3 rounded-full   border-2 border-white/75 bg-primary-500 " +
                        offlineClassName
                    }
                ></div>
            )}
        </div>
    );
});
export default Avatar;
