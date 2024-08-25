import React from "react";
import { getLogo, getDocumentType } from "@/helpers/fileHelpers";
import { IoMdCloseCircle } from "react-icons/io";
import { useState, useEffect } from "react";
import OverlayLoadingSpinner from "./OverlayLoadingSpinner";

export default function FileItem({
    file,
    maxWidth = "max-w-72",
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
        <div className="relative group">
            {!uploaded && uploadable && percentage < 100 && (
                <OverlayLoadingSpinner />
            )}
            {removable && (
                <button
                    className="absolute z-20 top-1 right-1 hidden group-hover:block"
                    onClick={() => remove()}
                >
                    <IoMdCloseCircle className="text-base" />
                </button>
            )}
            <div
                className={`flex gap-x-4 items-center  p-2 border border-white/15 rounded-xl ${
                    uploadable ? "group-hover:brightness-50" : ""
                }  ${
                    !uploaded && uploadable && percentage < 100
                        ? "brightness-50"
                        : ""
                } `}
            >
                <div className="h-8 aspect-square ">
                    <img
                        src={`/storage/${getLogo(file.type)}`}
                        alt="document"
                        className="h-full rounded-lg"
                    />
                </div>
                <div className="text-left">
                    <div className={`truncate ${maxWidth}`}>{file.name}</div>
                    <p className="">{getDocumentType(file.type)}</p>
                </div>
            </div>
        </div>
    );
}
