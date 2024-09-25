import FileItem from "@/Components/FileItem";
import Image from "@/Components/Image";
import React, { memo, useState } from "react";

const ImageFile = memo(({ file }) => {
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
}, arePropsEqual);
function arePropsEqual(oldProps, newProps) {
    return oldProps.file.id === newProps.file.id;
}
export default ImageFile