import FileItem from "@/Components/FileItem";
import Video from "@/Components/Video";
import React, { memo, useState } from "react";

const VideoFile = memo(({ file }) => {
    const [show, setShow] = useState(false);
    return (
        <div className="w-full">
            {show && (
                <Video
                    fullScreenMode
                    src={file.url}
                    onFullScreenClose={() => setShow(false)}
                />
            )}
            <div className="" onClick={() => setShow(true)}>
                <FileItem file={file} maxWidth="w-full" />
            </div>
        </div>
    );
}, arePropsEqual);
function arePropsEqual(oldProps, newProps) {
    return oldProps.file.id === newProps.file.id;
}
export default VideoFile;
