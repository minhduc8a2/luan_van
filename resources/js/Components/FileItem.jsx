import React, { memo } from "react";
import { getDocumentType, isImage } from "@/helpers/fileHelpers";
import { IoMdCloseCircle } from "react-icons/io";
import { useState, useEffect } from "react";
import LoadingSpinner from "@/Components/LoadingSpinner";
import FileIcon from "./FileIcon";
import { FaRegTrashAlt } from "react-icons/fa";

const FileItem = memo(function ({
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
                <LoadingSpinner />
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
                className={`flex gap-x-4 items-center ${maxWidth} p-2 border border-color/15 rounded-xl ${
                    uploadable ? "group-hover:brightness-50" : ""
                }  ${
                    !uploaded && uploadable && percentage < 100
                        ? "brightness-50"
                        : ""
                } `}
            >
                <div className="h-8 w-8 flex-shrink-0 relative overflow-hidden rounded">
                    {isImage(file.type) ? (
                        <img
                            src={file.url}
                            alt="document"
                            loading="lazy"
                            className="object-cover object-center "
                        />
                    ) : file.deleted_at ? (
                        <div className="w-full h-full flex justify-center items-center bg-foreground text-lg">
                            <FaRegTrashAlt />
                        </div>
                    ) : (
                        <div className="w-full h-full flex justify-center items-center bg-link text-lg">
                            <FileIcon type={file.type} />
                        </div>
                    )}
                </div>
                <div className="text-left max-w-full min-w-0 text-color-medium-emphasis">
                    {file.deleted_at ? (
                        "This file was deleted."
                    ) : (
                        <>
                            <div className={`truncate   `}>{file.name}</div>
                            <p className="">{getDocumentType(file.type)}</p>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
},
arePropsEqual);
function arePropsEqual(oldProps, newProps) {
    return (
        oldProps.file.id === newProps.file.id &&
        oldProps.percentage === newProps.percentage
    );
}
export default FileItem;
