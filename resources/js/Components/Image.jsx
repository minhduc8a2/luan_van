import React, { useState } from "react";
import OverlayLoadingSpinner from "./Overlay/OverlayLoadingSpinner";
import { PhotoView } from "react-photo-view";

export default function Image({ url, className, isInPhotoView = false }) {
    const [loading, setLoading] = useState(true);

    if (isInPhotoView)
        return (
            <PhotoView src={url}>
                <div
                    className={`h-64 aspect-[4/5] overflow-hidden relative rounded-lg ${className} ${
                        loading ? "bg-background border border-white/15" : ""
                    }`}
                >
                    {loading && <OverlayLoadingSpinner />}
                    <img
                        src={url}
                        alt=""
                        onLoad={() => setLoading(false)}
                        className=" object-cover object-center  cursor-pointer"
                    />
                </div>
            </PhotoView>
        );
    return (
        <div
            className={`h-64 aspect-[4/5] overflow-hidden relative rounded-lg ${className} ${
                loading ? "bg-background border border-white/15" : ""
            }`}
        >
            {loading && <OverlayLoadingSpinner />}
            <img
                src={url}
                alt=""
                onLoad={() => setLoading(false)}
                className=" object-cover object-center  cursor-pointer"
            />
        </div>
    );
}
