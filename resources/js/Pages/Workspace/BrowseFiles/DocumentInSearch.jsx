import React, { useState } from "react";
import Overlay from "@/Components/Overlay/Overlay";
import FileItem from "@/Components/FileItem";
import { IoMdCloudDownload } from "react-icons/io";
import { usePage } from "@inertiajs/react";
import { getDocumentType } from "@/helpers/fileHelpers";
export default function DocumentInSearch({ file, Icon, className = "" }) {
    const { publicAppUrl } = usePage().props;
    const [openOverlay, setOpenOverlay] = useState(false);
    console.log(file);
    return (
        <div className={className} key={"attachment_" + file.id}>
            <button
                onClick={() => setOpenOverlay(true)}
                className="flex items-center gap-x-4 w-full  "
            >
                <div className="flex-1 items-center flex gap-x-4 min-w-0 max-w-full overflow-hidden">
                    <div className="text-link">{Icon}</div>
                    <div className="text-left flex-1 min-w-0 max-w-full truncate overflow-hidden">
                        {file.name}
                    </div>
                </div>
                <div className="text-xs text-white/75">
                    {getDocumentType(file.type)}
                </div>
            </button>

            <Overlay
                show={openOverlay}
                onClose={() => setOpenOverlay(false)}
                toolbars={
                    <a href={file.url} download={true}>
                        <IoMdCloudDownload className="text-3xl" />
                    </a>
                }
            >
                <div className="flex justify-center flex-col items-center max-h-[95vh] mt-4 w-fit ">
                    <iframe
                        width={
                            window.innerWidth > 900
                                ? window.innerWidth / 2
                                : window.innerWidth - 200
                        }
                        height={window.innerHeight - 100}
                        src={`https://docs.google.com/gview?url=${
                            publicAppUrl + file.url
                        }&embedded=true `}
                    ></iframe>
                </div>
                <button onClick={() => setOpenOverlay(false)}>close</button>
            </Overlay>
        </div>
    );
}
