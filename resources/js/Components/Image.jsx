import React, { memo, useEffect, useMemo, useRef, useState } from "react";
import OverlayLoadingSpinner from "./Overlay/OverlayLoadingSpinner";
import { PhotoView } from "react-photo-view";
import { IoClose, IoCloudDownloadOutline } from "react-icons/io5";
import {
    Popover,
    PopoverButton,
    PopoverPanel,
    useClose,
} from "@headlessui/react";
import { usePage } from "@inertiajs/react";
import copy from "copy-to-clipboard";
import { MdDownload, MdMoreVert } from "react-icons/md";

const Image = memo(function Image({
    url,
    name,
    className = "",
    dimensions = "h-64 aspect-[4/5]",
    fullScreenMode = false,
    onFullScreenClose,
    deleteFn = () => {},
    noToolbar = false,
}) {
    const { publicAppUrl } = usePage().props;
    const [loading, setLoading] = useState(true);
    const [largeLoading, setLargeLoading] = useState(true);
    const [isHovered, setIsHovered] = useState(false);
    const [fullscreen, setFullscreen] = useState(fullScreenMode);
    const scaleRef = useRef(1);
    const initialPositionRef = useRef({ x: 0, y: 0 });

    const isMouseDownRef = useRef(false);
    const isDraggingRef = useRef(false);
    const largeImageRef = useRef(null);
    function toggleFullScreen() {
        if (onFullScreenClose) {
            onFullScreenClose();
            return;
        }

        setFullscreen((pre) => {
            return !pre;
        });
    }
    const close = useClose();
    if (!fullscreen && fullScreenMode) return "";

    function setScale(scale) {
        largeImageRef.current.classList.add("absolute");
        if (scale <= 0.2) return;
        scaleRef.current = scale;
        largeImageRef.current.style.transform = `scale(${scaleRef.current})`;
    }
    function toggleScale() {
        if (isDraggingRef.current) return;

        if (scaleRef.current < 2) {
            setScale(2);

            largeImageRef.current.style.cursor = "zoom-out";
        } else {
            setScale(1);

            largeImageRef.current.style.cursor = "zoom-in";
        }
    }
    useEffect(() => {
        if (fullscreen) {
            setScale(1);
        }
    }, [fullscreen]);

    function handleMouseDown(e) {
        e.preventDefault();

        isMouseDownRef.current = true;
        isDraggingRef.current = false;
        const computedStyle = window.getComputedStyle(largeImageRef.current);

        initialPositionRef.current = {
            x: e.clientX - parseInt(computedStyle.left || 0, 10),
            y: e.clientY - parseInt(computedStyle.top || 0, 10),
        };

        document.addEventListener("mousemove", handleMouseMove);
        document.addEventListener("mouseup", handleMouseUp);
    }

    function handleMouseMove(e) {
        if (isMouseDownRef.current) {
            isDraggingRef.current = true;
            largeImageRef.current.style.cursor = "grabbing";
        }
        const newX = e.clientX - initialPositionRef.current.x;
        const newY = e.clientY - initialPositionRef.current.y;

        largeImageRef.current.style.left = `${newX}px`;
        largeImageRef.current.style.top = `${newY}px`;
    }
    function handleMouseUp(e) {
        isMouseDownRef.current = false;
        if (isDraggingRef.current) {
            if (scaleRef.current == 2) {
                largeImageRef.current.style.cursor = "zoom-out";
            } else {
                largeImageRef.current.style.cursor = "zoom-in";
            }
        }
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
    }
    function handleWheel(e) {
        if (e.deltaY < 0) {
            setScale(scaleRef.current + 0.2);
            if (scaleRef.current + 0.2 > 2)
                largeImageRef.current.style.cursor = "zoom-out";
        } else if (e.deltaY > 0) {
            setScale(scaleRef.current - 0.2);
            if (scaleRef.current - 0.2 < 2)
                largeImageRef.current.style.cursor = "zoom-in";
        }
    }
    return (
        <div
            className={` overflow-hidden relative group/image rounded-lg  ${
                fullScreenMode ? "h-0 w-0" : dimensions
            } ${
                loading ? "bg-background border border-white/15" : ""
            }  ${className}`}
        >
            {loading && <OverlayLoadingSpinner />}
            {fullscreen && (
                <div className="top-8 left-8 right-8 bottom-8 overflow-hidden fixed bg-black/95 ring-[40px] ring-black/50  rounded-lg flex group/image_fullscreen justify-center items-center z-50 ">
                    {largeLoading && <OverlayLoadingSpinner />}
                    <div className="absolute top-2 right-2 hidden gap-x-2 group-hover/image_fullscreen:flex z-30">
                        <a
                            href={url}
                            download={name}
                            className=" p-2  rounded-lg text-white/85 hover:text-white hover:bg-white/15  "
                        >
                            <MdDownload className="text-lg" />
                        </a>

                        <button
                            className=" p-2  rounded-lg text-white/85 hover:text-white hover:bg-white/15  "
                            onClick={toggleFullScreen}
                        >
                            <IoClose className="text-lg" />
                        </button>
                    </div>

                    <img
                        src={url}
                        ref={largeImageRef}
                        alt=""
                        onLoad={() => setLargeLoading(false)}
                        onMouseDown={handleMouseDown}
                        onWheel={handleWheel}
                        onClick={toggleScale}
                        className=" max-h-full  z-20 cursor-zoom-in  transition-transform ease-out duration-200"
                    />
                    <img
                        src={url}
                        alt=""
                        onLoad={() => setLargeLoading(false)}
                        className="min-w-full min-h-full absolute top-0 left-0 z-10 blur-3xl brightness-50"
                    />
                </div>
            )}
            {!noToolbar && (
                <div
                    className={` border border-white/15 group-hover/image:flex ${
                        isHovered ? "flex" : "hidden"
                    }  transition z-20 gap-x-2 rounded bg-background p-1 absolute right-2 top-2 `}
                >
                    <a
                        className="p-1 rounded hover:bg-white/15 transition"
                        download
                        href={url}
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
                                    href={url}
                                    target="_blank"
                                    className=" hover:bg-white/15 py-1 text-left px-4"
                                >
                                    Open in new tab
                                </a>
                                <button
                                    className=" hover:bg-white/15 py-1 text-left px-4"
                                    onClick={() => {
                                        copy(publicAppUrl + url);
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
            <button
                className="w-full h-full relative overflow-hidden"
                onClick={() => setFullscreen(true)}
            >
                <img
                    src={url}
                    alt=""
                    loading="lazy"
                    onLoad={() => setLoading(false)}
                    className=" object-cover object-center min-w-full min-h-full  cursor-pointer"
                />
            </button>
        </div>
    );
},
arePropsEqual);
function arePropsEqual(oldProps, newProps) {
    return oldProps.url === newProps.url;
}
export default Image;
