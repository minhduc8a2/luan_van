import React, { memo, useEffect, useState } from "react";
import FileItem from "@/Components/FileItem";
import { IoMdCloudDownload } from "react-icons/io";
import {
    Popover,
    PopoverButton,
    PopoverPanel,
    useClose,
} from "@headlessui/react";
import { IoCloudDownloadOutline } from "react-icons/io5";
import { MdMoreVert } from "react-icons/md";
import copy from "copy-to-clipboard";
import { useSelector } from "react-redux";
import CustomedDialog from "@/Components/CustomedDialog";
import LoadingSpinner from "@/Components/LoadingSpinner";
const DocumentAttachment = memo(function ({
    attachment,
    openOverlay,
    setOpenOverlay,
    deleteFn = () => {},
    className = "",
    noToolbar = false,
}) {
    const { publicAppUrl } = useSelector((state) => state.workspace);
    const [isHovered, setIsHovered] = useState(false);
    const [loading, setLoading] = useState(true);

    const close = useClose();
    useEffect(() => {
        setLoading(true);
    }, [openOverlay]);
    return (
        <div
            className={"group/document relative     " + className}
            key={"attachment_" + attachment.id}
        >
            {!noToolbar && (
                <div
                    className={` border border-color/15 group-hover/document:flex ${
                        isHovered ? "flex" : "hidden"
                    }  transition z-20 gap-x-2 rounded bg-background p-1 absolute right-2 top-2 `}
                >
                    <a
                        className="p-1 rounded hover:bg-color/15 transition"
                        download
                        href={attachment.url}
                    >
                        <IoCloudDownloadOutline className="text-xl text-color-medium-emphasis" />
                    </a>
                    <Popover className="relative">
                        <PopoverButton className="p-1 rounded hover:bg-color/15 transition">
                            <div
                                onClick={() => {
                                    setIsHovered(true);
                                }}
                            >
                                <MdMoreVert className="text-xl text-color-medium-emphasis" />
                            </div>
                        </PopoverButton>
                        <PopoverPanel anchor="bottom" className="">
                            <div className="w-64 flex flex-col z-20 relative rounded-lg mt-4 border border-color/15 py-2 bg-background ">
                                <a
                                    href={attachment.url}
                                    target="_blank"
                                    className=" hover:bg-color/15 py-1 text-left px-4"
                                >
                                    Open in new tab
                                </a>
                                <button
                                    className=" hover:bg-color/15 py-1 text-left px-4"
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
                                    className="text-danger-500 hover:bg-color/15 py-1 text-left px-4"
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

            <CustomedDialog
                isOpen={openOverlay}
                onClose={() => setOpenOverlay(false)}
                className="flex justify-center flex-col items-center max-h-[95vh] mt-4 w-fit p-0 relative"
            >
                <a
                    href={attachment.url}
                    download={true}
                    className="absolute top-4 left-4"
                >
                    <IoMdCloudDownload className="text-3xl" />
                </a>
                {loading && <LoadingSpinner />}

                <iframe
                    className={`${loading ? "invisible" : ""}`}
                    width={
                        window.innerWidth > 900
                            ? window.innerWidth / 2
                            : window.innerWidth - 200
                    }
                    height={window.innerHeight - 100}
                    onLoad={() => {
                        console.log("Iframe loaded");
                        setLoading(false);
                    }}
                    src={`https://docs.google.com/gview?url=${
                        publicAppUrl + attachment.url
                    }&embedded=true `}
                ></iframe>
            </CustomedDialog>
        </div>
    );
},
arePropsEqual);
function arePropsEqual(oldProps, newProps) {
    return (
        oldProps.attachment.id === newProps.attachment.id &&
        oldProps.openOverlay == newProps.openOverlay
    );
}
export default DocumentAttachment;
