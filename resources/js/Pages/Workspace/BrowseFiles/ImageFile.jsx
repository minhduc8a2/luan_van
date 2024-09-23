import FileItem from "@/Components/FileItem";
import Image from "@/Components/Image";
import React, { useState } from "react";

export default function ImageFile({ file }) {
    const [show, setShow] = useState(false);
    return (
        <div className="">
            {show && (
                <Image
                    fullScreenMode
                    url={file.url}
                    name={file.name}
                    onFullScreenClose={() => setShow(false)}
                />
            )}
            <button className="w-full" onClick={() => setShow(true)}>
                <FileItem file={file} maxWidth="w-full" />
            </button>
        </div>
    );
}
