import {
    Popover,
    PopoverButton,
    PopoverPanel,
    useClose,
} from "@headlessui/react";
import React, { useEffect, useRef, useState } from "react";
import { IoCloudDownloadOutline } from "react-icons/io5";
import { MdMoreVert } from "react-icons/md";
import DocumentAttachment from "../ChatArea/Message/DocumentAttachment";
import ImageFile from "./ImageFile";
import { isDocument, isImage, isVideo } from "@/helpers/fileHelpers";
import FileItem from "@/Components/FileItem";
import VideoFile from "./VideoFile";

export default function Item({ file }) {
    const [openOverlay, setOpenOverlay] = useState(false);
    const [isHovered, setIsHovered] = useState(false);

    return (
        <div className="mt-4 relative group/file_item" key={file.id}>
            <div
                className={` border border-white/15 group-hover/file_item:flex ${
                    isHovered ? "flex" : "hidden"
                }  transition z-20 gap-x-2 rounded bg-background p-1 absolute right-2 top-1/2 -translate-y-1/2`}
            >
                <a
                    className="p-1 rounded hover:bg-white/15 transition"
                    href={file.url}
                    download={file.name}
                >
                    <IoCloudDownloadOutline className="text-xl" />
                </a>
                <Popover className="relative">
                    {({ open }) => {
                        if (!open) setIsHovered(false);
                        return (
                            <>
                                <PopoverButton className="p-1 rounded hover:bg-white/15 transition">
                                    <div
                                        onClick={() => {
                                            setIsHovered(true);
                                            console.log("is hovered");
                                        }}
                                    >
                                        <MdMoreVert className="text-xl" />
                                    </div>
                                </PopoverButton>
                                <PopoverPanel anchor="bottom" className="">
                                    <div className="w-64 flex flex-col rounded-lg mt-4 border border-white/15 py-2 bg-background ">
                                        <a
                                            href={file.url}
                                            target="_blank"
                                            className=" hover:bg-white/15 py-1 text-left px-4"
                                        >
                                            Open in new tab
                                        </a>
                                        <button className=" hover:bg-white/15 py-1 text-left px-4">
                                            Copy link to file
                                        </button>
                                        <button className="text-danger-500 hover:bg-white/15 py-1 text-left px-4">
                                            Delete
                                        </button>
                                    </div>
                                </PopoverPanel>
                            </>
                        );
                    }}
                </Popover>
            </div>
            {isDocument(file.type) && (
                <DocumentAttachment
                    className="w-full"
                    attachment={file}
                    openOverlay={openOverlay}
                    setOpenOverlay={(status) => setOpenOverlay(status)}
                />
            )}
            {isImage(file.type) && <ImageFile file={file} />}
            {isVideo(file.type) && <VideoFile file={file} />}
            
        </div>
    );
}
