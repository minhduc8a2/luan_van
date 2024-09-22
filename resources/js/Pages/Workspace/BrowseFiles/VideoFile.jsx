import FileItem from "@/Components/FileItem";
import Video from "@/Components/Video";
import React, { useState } from "react";

export default function VideoFile({ file }) {
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
}
