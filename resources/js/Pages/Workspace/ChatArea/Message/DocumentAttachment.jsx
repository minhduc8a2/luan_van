import React from "react";
import Overlay from "@/Components/Overlay/Overlay";
import FileItem from "@/Components/FileItem";
import { IoMdCloudDownload } from "react-icons/io";
import { usePage } from "@inertiajs/react";
export default function DocumentAttachment({
    attachment,
    openOverlay,
    setOpenOverlay,
    className = "",
}) {
    const { publicAppUrl } = usePage().props;
    return (
        <div className={className} key={"attachment_" + attachment.id}>
            <button onClick={() => setOpenOverlay(true)} className="w-full">
                <FileItem file={attachment} maxWidth="w-full" />
            </button>
            <Overlay
                show={openOverlay}
                onClose={() => setOpenOverlay(false)}
                toolbars={
                    <a href={attachment.url} download={true}>
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
                            publicAppUrl + attachment.url
                        }&embedded=true `}
                    ></iframe>
                </div>
                <button onClick={() => setOpenOverlay(false)}>close</button>
            </Overlay>
        </div>
    );
}
