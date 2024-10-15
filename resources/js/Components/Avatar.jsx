
import ThemeContext from "@/ThemeProvider";
import React, { memo, useContext } from "react";
import defaultAvatar from "@/../images/default_avatar.png"

const Avatar = memo(function ({
    src = "",
    className = "",
    isOnline,
    onlineClassName = "",
    offlineClassName = "",
    noStatus = false,
    roundedClassName = "rounded-lg ",
}) {
  
    const {theme} = useContext(ThemeContext)
    return (
        <div className={`relative ${theme.mode?"":"shadow rounded-lg"} ` + className}>
            <img
                src={src || defaultAvatar}
                className={`${roundedClassName} w-full h-full object-cover absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 `}
            />
            {noStatus ? (
                ""
            ) : isOnline ? (
                <div
                    className={
                        "absolute -bottom-1 -right-1 h-3 w-3 rounded-full bg-green-600  border-2 border-color/50 " +
                        onlineClassName
                    }
                ></div>
            ) : (
                <div
                    className={
                        "absolute -bottom-1 -right-1 h-3 w-3 rounded-full   border-2 border-color/25 bg-primary-500 " +
                        offlineClassName
                    }
                ></div>
            )}
        </div>
    );
});
export default Avatar;
