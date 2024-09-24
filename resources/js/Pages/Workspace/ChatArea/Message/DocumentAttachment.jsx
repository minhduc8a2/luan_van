import React, { useState } from "react";
import Overlay from "@/Components/Overlay/Overlay";
import FileItem from "@/Components/FileItem";
import { IoMdCloudDownload } from "react-icons/io";
import { usePage } from "@inertiajs/react";
import {
    Popover,
    PopoverButton,
    PopoverPanel,
    useClose,
} from "@headlessui/react";
import { IoCloudDownloadOutline } from "react-icons/io5";
import { MdMoreVert } from "react-icons/md";
import copy from "copy-to-clipboard";
export default function DocumentAttachment({
    attachment,
    openOverlay,
    setOpenOverlay,
    deleteFn = () => {},
    className = "",
    noToolbar = false,
}) {
    const { publicAppUrl } = usePage().props;
    const [isHovered, setIsHovered] = useState(false);
    const close = useClose();

    return (
        <div
            className={"group/document relative     " + className}
            key={"attachment_" + attachment.id}
        >
            {!noToolbar && (
                <div
                    className={` border border-white/15 group-hover/document:flex ${
                        isHovered ? "flex" : "hidden"
                    }  transition z-20 gap-x-2 rounded bg-background p-1 absolute right-2 top-2 `}
                >
                    <a
                        className="p-1 rounded hover:bg-white/15 transition"
                        download
                        href={attachment.url}
                    >
                        <IoCloudDownloadOutline className="text-xl" />
                    </a>
                    <Popover className="relative">
                        <PopoverButton className="p-1 rounded hover:bg-white/15 transition">
                            <div
                                onClick={() => {
                                    setIsHovered(true);
                                }}
                            >
                                <MdMoreVert className="text-xl" />
                            </div>
                        </PopoverButton>
                        <PopoverPanel anchor="bottom" className="">
                            <div className="w-64 flex flex-col z-20 relative rounded-lg mt-4 border border-white/15 py-2 bg-background ">
                                <a
                                    href={attachment.url}
                                    target="_blank"
                                    className=" hover:bg-white/15 py-1 text-left px-4"
                                >
                                    Open in new tab
                                </a>
                                <button
                                    className=" hover:bg-white/15 py-1 text-left px-4"
                                    onClick={() => {
                                        copy(publicAppUrl + attachment.url);
                                        close();
                                        setIsHovered(false);
                                    }}
                                >
                                    Copy link to file
                                </button>
                                <button
                                    onClick={() => deleteFn()}
                                    className="text-danger-500 hover:bg-white/15 py-1 text-left px-4"
                                >
                                    Delete
                                </button>
                            </div>
                            <div
                                className="fixed top-0 bottom-0 right-0 left-0 bg-transparent overflow-hidden z-10"
                                onClick={() => {
                                    close();

                                    setIsHovered(false);
                                }}
                            ></div>
                        </PopoverPanel>
                    </Popover>
                </div>
            )}
            <button onClick={() => setOpenOverlay(true)} className="w-full ">
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
