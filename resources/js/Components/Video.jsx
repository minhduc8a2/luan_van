import React, { useRef } from "react";
import { useState } from "react";
import OverlayLoadingSpinner from "./Overlay/OverlayLoadingSpinner";
import { FaPlay } from "react-icons/fa";
import { IoIosPause } from "react-icons/io";
import { formatToMinuteSecond } from "@/helpers/dateTimeHelper";
import { HiVolumeUp } from "react-icons/hi";
import { HiVolumeOff } from "react-icons/hi";
import { MdDownload, MdMoreVert } from "react-icons/md";
import { RiExpandDiagonalFill } from "react-icons/ri";
import { IoClose } from "react-icons/io5";
import {
    Popover,
    PopoverButton,
    PopoverPanel,
    useClose,
} from "@headlessui/react";
import copy from "copy-to-clipboard";
import { usePage } from "@inertiajs/react";
export default function Video({
    className = "",
    loadingClassname = " border border-white/15",
    name = "",
    src = "",
    fullScreenMode = false,
    onFullScreenClose,
    deleteFn,
    noToolbar = false,
}) {
    const { publicAppUrl } = usePage().props;
    const [smallLoaded, setSmallLoaded] = useState(false);
    const [largeLoaded, setLargeLoaded] = useState(false);
    const [playing, setPlaying] = useState(false);
    const [volume, setVolume] = useState(1);
    const smallVideoRef = useRef(null);
    const largeVideoRef = useRef(null);
    const [progress, setProgress] = useState(0);
    const [duration, setDuration] = useState(0);
    const [isDirty, setIsDirty] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const [fullscreen, setFullscreen] = useState(fullScreenMode);
    const timeoutRef = useRef(null);
    const [isMouseMoving, setIsMouseMoving] = useState(false);
    const close = useClose();
    if (!src) return "";
    const showController = () => {
        setIsMouseMoving(true);
    };

    const hideController = () => {
        setIsMouseMoving(false);
    };
    const handleMouseMove = () => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
        console.log(isMouseMoving);
        showController();

        timeoutRef.current = setTimeout(hideController, 1000);
    };

    function playVideo(videoElement) {
        setIsDirty(true);
        if (playing) {
            videoElement.pause();
        } else {
            videoElement.play();
        }
    }
    const handleVolumeChange = (e, videoElement) => {
        const newVolume = e.target.value;
        videoElement.volume = newVolume;
        setVolume(newVolume);
    };
    const handleTimeUpdate = (videoElement) => {
        const currentTime = videoElement.currentTime;
        const duration = videoElement.duration;
        setProgress((currentTime / duration) * 100);
    };
    const handleProgressChange = (e, videoElement) => {
        const newProgress = parseFloat(e.target.value);
        console.log(`newProgress: ${newProgress}`); // Debugging line
        const duration = videoElement.duration;
        setProgress(newProgress);
        videoElement.currentTime = (newProgress / 100) * duration;
    };

    const toggleMute = (videoElement) => {
        if (volume != 0) {
            setVolume(0);
            videoElement.volume = 0;
        } else {
            setVolume(1);
            videoElement.volume = 1;
        }
    };

    function toggleFullScreen() {
        if (onFullScreenClose) {
            onFullScreenClose();
            return;
        }
        if (!fullscreen) {
            smallVideoRef.current.pause();
            setPlaying(false);
            smallVideoRef.current.currentTime = 0;
        } else {
            largeVideoRef.current.pause();
            setPlaying(false);
            largeVideoRef.current.currentTime = 0;
        }
        setFullscreen((pre) => {
            return !pre;
        });
    }

    if (!fullscreen && fullScreenMode) return "";
    return (
        <div
            className={`relative aspect-[4/5]   overflow-hidden group/video ${
                !smallLoaded ? loadingClassname : ""
            } ${className}`}
        >
            {!playing && (
                <button className="p-2 rounded gap-x-2 flex bg-black/75 justify-center items-center group-hover/video:hidden absolute bottom-2 left-2">
                    <FaPlay className="text-sm" />
                    <div className="font-bold ">
                        {formatToMinuteSecond(duration)}
                    </div>
                </button>
            )}
            {fullscreen && (
                <div
                    className="top-8 left-8 right-8 bottom-8 fixed bg-black/95 ring-[40px] ring-black/50  rounded-lg flex group/video justify-center z-50 "
                    onMouseMove={handleMouseMove}
                >
                    {!largeLoaded && <OverlayLoadingSpinner />}
                    <button
                        onClick={() => playVideo(largeVideoRef.current)}
                        className="h-ful"
                    >
                        <video
                            ref={largeVideoRef}
                            autoPlay
                            controls={false}
                            onTimeUpdate={() =>
                                handleTimeUpdate(largeVideoRef.current)
                            }
                            className={`  ${
                                largeLoaded ? "max-h-full min-h-full" : "hidden"
                            } `}
                            src={src}
                            onLoadedMetadata={() => {
                                setDuration(largeVideoRef.current.duration);
                            }}
                            onCanPlay={(e) => {
                                setLargeLoaded(true);
                            }}
                            onPause={() => {
                                setPlaying(false);
                            }}
                            onPlay={() => {
                                setPlaying(true);
                            }}
                        />
                    </button>

                    <div className="absolute top-2 right-2 hidden gap-x-2 group-hover/video:flex">
                        <a
                            href={src}
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

                    {largeLoaded && (
                        <div
                            className={`absolute bottom-2 left-1/2  flex-col -translate-x-1/2 w-[98%] rounded-lg h-16 bg-black/75 hidden items-center justify-between hover:!flex  px-3  ${
                                isMouseMoving ? "!flex" : ""
                            }`}
                        >
                            <input
                                type="range"
                                min="0"
                                max="100"
                                step="1"
                                value={progress}
                                onChange={(e) =>
                                    handleProgressChange(
                                        e,
                                        largeVideoRef.current
                                    )
                                }
                                className={`w-full mt-4 h-1 range-small`}
                                style={{
                                    background: `linear-gradient(to right, #1d9bd1 ${progress}%, rgb(255 255 255 / 0.5) ${progress}%)`,
                                }}
                            />
                            <div className="flex gap-x-4 py-3 w-full  items-center">
                                <div className="flex gap-x-2 items-center">
                                    <button
                                        onClick={() =>
                                            playVideo(largeVideoRef.current)
                                        }
                                        className="h-8 w-8 rounded flex justify-center items-center hover:bg-white/10 p-1"
                                    >
                                        {playing ? (
                                            <IoIosPause className="text-xl" />
                                        ) : (
                                            <FaPlay className="text-sm" />
                                        )}
                                    </button>
                                    <div className="font-bold w-12">
                                        {formatToMinuteSecond(
                                            isDirty
                                                ? (progress / 100) * duration
                                                : duration
                                        )}
                                    </div>
                                </div>
                                <div className="relative group/volume flex items-center">
                                    <button
                                        className="group-hover/volume:invisible"
                                        onClick={() =>
                                            toggleMute(largeVideoRef.current)
                                        }
                                    >
                                        {volume == 0 ? (
                                            <HiVolumeOff className="text-xl" />
                                        ) : (
                                            <HiVolumeUp className="text-xl" />
                                        )}
                                    </button>
                                    <div className="absolute hidden group-hover/volume:flex -bottom-full gap-x-2 -mb-[22px] -rotate-90 origin-left left-1/2  bg-white/10 p-4 rounded  items-center ">
                                        {" "}
                                        <button
                                            className="rotate-90"
                                            onClick={() =>
                                                toggleMute(
                                                    largeVideoRef.current
                                                )
                                            }
                                        >
                                            {volume == 0 ? (
                                                <HiVolumeOff className="text-xl" />
                                            ) : (
                                                <HiVolumeUp className="text-xl" />
                                            )}
                                        </button>
                                        <input
                                            className="h-1 range-small "
                                            type="range"
                                            min="0"
                                            max="1"
                                            step="0.1"
                                            value={volume}
                                            onChange={(e) =>
                                                handleVolumeChange(
                                                    e,
                                                    largeVideoRef.current
                                                )
                                            }
                                            style={{
                                                background: `linear-gradient(to right, #1d9bd1 ${
                                                    volume * 100
                                                }%, rgb(255 255 255 / 0.5) ${
                                                    volume * 100
                                                }%)`,
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}
            {!smallLoaded && <OverlayLoadingSpinner />}
            <button onClick={() => playVideo(smallVideoRef.current)} className="min-w-full min-h-full relative">
                <video
                    ref={smallVideoRef}
                    controls={false}
                    onTimeUpdate={() => handleTimeUpdate(smallVideoRef.current)}
                    className={`  ${
                        smallLoaded ? "absolute top-0 left-0 w-full h-full object-cover " : "hidden"
                    } `}
                    src={src}
                    onLoadedMetadata={() => {
                        setDuration(smallVideoRef.current.duration);
                    }}
                    onCanPlay={() => {
                        setSmallLoaded(true);
                    }}
                    onPause={() => {
                        setPlaying(false);
                    }}
                    onPlay={() => {
                        setPlaying(true);
                    }}
                />
            </button>

            {smallLoaded && !noToolbar && (
                <div
                    className={`absolute top-2 right-2  gap-x-2  group-hover/video:flex ${
                        isHovered ? "flex" : "hidden"
                    }`}
                >
                    <button
                        className=" p-2 bg-black/75 rounded-lg text-white/85 hover:text-white hover:bg-black/85  "
                        onClick={toggleFullScreen}
                    >
                        <RiExpandDiagonalFill className="text-lg" />
                    </button>
                    <Popover className="relative">
                        <PopoverButton className=" p-2 bg-black/75 rounded-lg text-white/85 hover:text-white hover:bg-black/85">
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
                                    href={src}
                                    target="_blank"
                                    className=" hover:bg-white/15 py-1 text-left px-4"
                                >
                                    Open in new tab
                                </a>
                                <button
                                    className=" hover:bg-white/15 py-1 text-left px-4"
                                    onClick={() => {
                                        copy(publicAppUrl + src);
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

            {smallLoaded && (
                <div className="absolute bottom-2 left-1/2 group-hover/video:flex flex-col -translate-x-1/2 w-[98%] rounded-lg h-18 bg-black/75 hidden items-center justify-between  px-3">
                    <input
                        type="range"
                        min="0"
                        max="100"
                        step="1"
                        value={progress}
                        onChange={(e) =>
                            handleProgressChange(e, smallVideoRef.current)
                        }
                        className={`w-full mt-4 h-1 range-small`}
                        style={{
                            background: `linear-gradient(to right, #1d9bd1 ${progress}%, rgb(255 255 255 / 0.5) ${progress}%)`,
                        }}
                    />
                    <div className="flex gap-x-4 py-3 w-full  items-center">
                        <div className="flex gap-x-2 items-center">
                            <button
                                onClick={() => playVideo(smallVideoRef.current)}
                                className="h-8 w-8 flex justify-center items-center hover:bg-white/10 rounded"
                            >
                                {playing ? (
                                    <IoIosPause className="text-xl" />
                                ) : (
                                    <FaPlay className="text-sm" />
                                )}
                            </button>
                            <div className="font-bold w-12">
                                {formatToMinuteSecond(
                                    isDirty
                                        ? (progress / 100) * duration
                                        : duration
                                )}
                            </div>
                        </div>
                        <div className="relative group/volume flex items-center">
                            <button
                                className="group-hover/volume:invisible"
                                onClick={() =>
                                    toggleMute(smallVideoRef.current)
                                }
                            >
                                {volume == 0 ? (
                                    <HiVolumeOff className="text-xl" />
                                ) : (
                                    <HiVolumeUp className="text-xl" />
                                )}
                            </button>
                            <div className="absolute hidden group-hover/volume:flex -bottom-full gap-x-2 -mb-[22px] -rotate-90 origin-left left-1/2  bg-black/75 p-4 rounded  items-center ">
                                {" "}
                                <button
                                    className="rotate-90"
                                    onClick={() =>
                                        toggleMute(smallVideoRef.current)
                                    }
                                >
                                    {volume == 0 ? (
                                        <HiVolumeOff className="text-xl" />
                                    ) : (
                                        <HiVolumeUp className="text-xl" />
                                    )}
                                </button>
                                <input
                                    className="h-1 range-small "
                                    type="range"
                                    min="0"
                                    max="1"
                                    step="0.1"
                                    value={volume}
                                    onChange={(e) =>
                                        handleVolumeChange(
                                            e,
                                            smallVideoRef.current
                                        )
                                    }
                                    style={{
                                        background: `linear-gradient(to right, #1d9bd1 ${
                                            volume * 100
                                        }%, rgb(255 255 255 / 0.5) ${
                                            volume * 100
                                        }%)`,
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
