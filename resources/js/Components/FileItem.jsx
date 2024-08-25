import React from "react";
import { getLogo, getDocumentType } from "@/helpers/fileHelpers";
import { IoMdCloseCircle } from "react-icons/io";
export default function FileItem({
    file,
    maxWidth = "max-w-72",
    removable = false,
    remove = () => {},
}) {
    return (
        <div className="flex gap-x-4 items-center  p-2 border border-white/15 rounded-xl relative">
            {removable && (
                <button
                    className="absolute top-1 right-1"
                    onClick={() => remove()}
                >
                    <IoMdCloseCircle className="text-base" />
                </button>
            )}
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
    );
}
