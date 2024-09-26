import FileItem from "@/Components/FileItem";
import Video from "@/Components/Video";
import { setMedia } from "@/Store/mediaSlice";
import React, { memo, useState } from "react";
import { useDispatch } from "react-redux";

const VideoFile = memo(function ({ file }) {
    const dispatch = useDispatch();
    return (
        <button
            className="w-full"
            onClick={() =>
                dispatch(
                    setMedia({
                        type: "video",
                        url: file.url,
                        name: file.name,
                    })
                )
            }
        >
            <FileItem file={file} maxWidth="w-full" />
        </button>
    );
}, arePropsEqual);
function arePropsEqual(oldProps, newProps) {
    return oldProps.file.id === newProps.file.id;
}
export default VideoFile;
