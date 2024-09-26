import FileItem from "@/Components/FileItem";
import Image from "@/Components/Image";
import { setMedia } from "@/Store/mediaSlice";
import React, { memo, useState } from "react";
import { useDispatch } from "react-redux";

const ImageFile = memo(function ({ file }) {
    const dispatch = useDispatch();
    return (
        <div className="">
            <button
                className="w-full"
                onClick={() =>
                    dispatch(
                        setMedia({
                            type: "image",
                            url: file.url,
                            name: file.name,
                        })
                    )
                }
            >
                <FileItem file={file} maxWidth="w-full" />
            </button>
        </div>
    );
}, arePropsEqual);
function arePropsEqual(oldProps, newProps) {
    return oldProps.file.id === newProps.file.id;
}
export default ImageFile;
