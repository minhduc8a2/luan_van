import {
    Popover,
    PopoverButton,
    PopoverPanel,
    useClose,
} from "@headlessui/react";
import React, { memo, useEffect, useRef, useState } from "react";
import { IoCloudDownloadOutline } from "react-icons/io5";
import { MdMoreVert } from "react-icons/md";
import DocumentAttachment from "../ChatArea/Message/DocumentAttachment";
import ImageFile from "./ImageFile";
import { isDocument, isImage, isVideo } from "@/helpers/fileHelpers";

import VideoFile from "./VideoFile";
import copy from "copy-to-clipboard";

import OverlayConfirm from "@/Components/Overlay/OverlayConfirm";
import FileItem from "@/Components/FileItem";
import { usePage } from "@inertiajs/react";
import { useDispatch, useSelector } from "react-redux";
import { setNotificationPopup } from "@/Store/notificationPopupSlice";

const Item = memo(function ({ file }) {
    const { publicAppUrl } = useSelector((state) => state.workspace);
    const [openOverlay, setOpenOverlay] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const [showConfirm, setShowConfirm] = useState(null);
    const dispatch = useDispatch();
    const close = useClose();
    function deleteFile() {
        return axios
            .delete(
                route("files.delete", {
                    file: file.id,
                }),
                {
                    headers: {
                        "X-Socket-Id": Echo.socketId(),
                    },
                }
            )
            .catch((error) => {
                if (error.response) {
                    if (error.response.status === 403) {
                        dispatch(
                            setNotificationPopup({
                                type: "error",
                                messages: [
                                    "You are not authorized to delete this file.",
                                ],
                            })
                        );
                    } else {
                        dispatch(
                            setNotificationPopup({
                                type: "error",
                                messages: [
                                    error.response.data.message ||
                                        "An error occurred.",
                                ],
                            })
                        );
                    }
                } else {
                    dispatch(
                        setNotificationPopup({
                            type: "error",
                            messages: ["An unexpected error occurred."],
                        })
                    );
                }
            });
    }
    return (
        <div className="mt-4 relative group/file_item" key={file.id}>
            <OverlayConfirm
                show={showConfirm}
                onClose={() => setShowConfirm(false)}
                onConfirm={() => {
                    deleteFile();
                    setShowConfirm(null);
                }}
                title="Delete file"
                message={
                    <div className="flex flex-col gap-y-4">
                        <h5>
                            Are you sure you want to delete this file
                            permanently?
                        </h5>
                        {file && <FileItem file={file} maxWidth="max-w-full" />}
                    </div>
                }
            />
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
                                href={file.url}
                                target="_blank"
                                className=" hover:bg-white/15 py-1 text-left px-4"
                            >
                                Open in new tab
                            </a>
                            <button
                                className=" hover:bg-white/15 py-1 text-left px-4"
                                onClick={() => {
                                    copy(publicAppUrl + file.url);
                                    close();
                                    setIsHovered(false);
                                }}
                            >
                                Copy link to file
                            </button>
                            <button
                                className="text-danger-500 hover:bg-white/15 py-1 text-left px-4"
                                onClick={() => setShowConfirm(true)}
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
}, arePropsEqual);
function arePropsEqual(oldProps, newProps) {
    return oldProps.file.id === newProps.file.id;
}
export default Item;
