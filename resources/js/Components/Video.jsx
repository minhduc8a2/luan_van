import React, { useRef } from "react";
import { useState } from "react";
import OverlayLoadingSpinner from "./Overlay/OverlayLoadingSpinner";
import { FaPlay } from "react-icons/fa";
import { IoIosPause } from "react-icons/io";
export default function Video({
    className = "",
    loadingClassname = " bg-black",
    ...props
}) {
    const [loaded, setLoaded] = useState(false);
    const [playing, setPlaying] = useState(false);
    const videoRef = useRef(null);
    function playVideo() {
        if (playing) {
            videoRef.current.pause();
        } else {
            videoRef.current.play();
        }
    }

    return (
        <div
            className={`relative aspect-[4/5] overflow-hidden group/video ${
                !loaded ? loadingClassname : ""
            } ${className}`}
        >
            {!loaded && <OverlayLoadingSpinner />}
            <video
                ref={videoRef}
                className={`object-cover object-center rounded-lg ${
                    loaded ? "" : "hidden"
                } `}
                {...props}
                onCanPlayThrough={(e) => {
                    setLoaded(true);
                }}
                onPause={() => {
                    setPlaying(false);
                }}
                onPlay={() => {
                    setPlaying(true);
                }}
            />
            <div className="absolute bottom-2 left-1/2 group-hover/video:flex -translate-x-1/2 w-[98%] rounded-lg h-12 bg-black/50 hidden items-center justify-between px-3">
                <button onClick={playVideo}>
                    {playing ? (
                        <IoIosPause className="text-lg" />
                    ) : (
                        <FaPlay className="text-sm" />
                    )}
                </button>
            </div>
        </div>
    );
}
