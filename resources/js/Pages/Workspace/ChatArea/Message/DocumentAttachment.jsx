import React, { memo, useState } from "react";
import FileItem from "@/Components/FileItem";

import {
    Popover,
    PopoverButton,
    PopoverPanel,
    useClose,
} from "@headlessui/react";
import { IoCloudDownloadOutline } from "react-icons/io5";
import { MdMoreVert } from "react-icons/md";
import copy from "copy-to-clipboard";
import { useDispatch, useSelector } from "react-redux";

import { setMedia } from "@/Store/mediaSlice";
const DocumentAttachment = memo(function ({
    attachment,

    deleteFn = () => {},
    className = "",
    noToolbar = false,
}) {
    const publicAppUrl = import.meta.env.VITE_PUBLIC_APP_URL;
    const [isHovered, setIsHovered] = useState(false);
    const dispatch = useDispatch();

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
                        {({ close }) => (
                            <>
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
                                                copy(
                                                    publicAppUrl +
                                                        attachment.url
                                                );
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
                            </>
                        )}
                    </Popover>
                </div>
            )}
            <button
                onClick={() =>
                    dispatch(
                        setMedia({
                            type: "document",
                            url: attachment.url,
                            name: attachment.name,
                        })
                    )
                }
                className="w-full "
            >
                <FileItem file={attachment} maxWidth="w-full" />
            </button>
        </div>
    );
}, arePropsEqual);
function arePropsEqual(oldProps, newProps) {
    return (
        oldProps.attachment.id === newProps.attachment.id &&
        oldProps.openOverlay == newProps.openOverlay
    );
}
export default DocumentAttachment;
