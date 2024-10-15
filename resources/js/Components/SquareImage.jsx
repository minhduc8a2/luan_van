import React from "react";
import { useState, useRef, useEffect } from "react";
import { IoMdCloseCircle } from "react-icons/io";
import LoadingSpinner from "@/Components/LoadingSpinner";
import defaultAvatar from "@/../images/default_avatar.png"

export default function SquareImage({
    size = "h-20 w-20",
    url,
    removable = false,
    remove = () => {},
    uploadable = false,
    percentage = 0,
}) {
    const [uploaded, setUploaded] = useState(false);
   
    useEffect(() => {
        if (percentage == 100) setUploaded(true);
    }, [percentage]);
    return (
        <div className=" relative group">
            {removable && (
                <button
                    className="absolute -top-1 -right-1 z-20"
                    onClick={() => remove()}
                >
                    <IoMdCloseCircle className="text-base drop-shadow hidden group-hover:block " />
                </button>
            )}
            {!uploaded && uploadable && percentage < 100 && (
                <LoadingSpinner />
            )}
            <div
                className={`  relative overflow-hidden flex justify-center items-center rounded-lg group-hover:brightness-50 ${
                    !uploaded && uploadable && percentage < 100
                        ? "brightness-50"
                        : ""
                }  ${size}`}
            >
                <img
                    src={url || defaultAvatar}
                    alt=""
                    className="object-cover w-full h-full absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                />
            </div>
        </div>
    );
}
