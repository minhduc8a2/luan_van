import React, { useEffect, useRef } from "react";
import { IoReloadOutline } from "react-icons/io5";
import { useInView } from "react-intersection-observer";
import OverlayLoadingSpinner from "./Overlay/OverlayLoadingSpinner";

export default function InfiniteScroll({
    children,
    topLoading,
    bottomLoading,
    topHasMore,
    bottomHasMore,
    loadMoreOnTop,
    loadMoreOnBottom,
    className = "",
    manualLoadButtons = false,
    loadingMessage = false,
}) {
    const containerRef = useRef(null);
    const { ref: top_ref, inView: top_inView } = useInView({
        threshold: 0.1,
        root: containerRef.current,
        rootMargin: "500px",
    });
    const { ref: bottom_ref, inView: bottom_inView } = useInView({
        threshold: 0.1,
        root: containerRef.current,
        rootMargin: "500px",
    });

    useEffect(() => {
        console.log("top :", top_inView);
        if (topHasMore && !topLoading && top_inView) {
            loadMoreOnTop();
            console.log("load more on top");
        }
    }, [top_inView, topHasMore, topLoading]);

    useEffect(() => {
        if (bottomHasMore && !bottomLoading && bottom_inView) {
            loadMoreOnBottom();
            console.log("load more on bottom");
        }
    }, [bottom_inView, bottomHasMore, bottomLoading]);
    return (
        <ul className={className} ref={containerRef}>
            {loadingMessage && topLoading && (
                <div className="flex gap-x-2 items-center">
                    <div className="h-6 w-6 relative">
                        <OverlayLoadingSpinner />
                    </div>
                    <div className="text-xs">Loading ...</div>
                </div>
            )}
            {manualLoadButtons && topHasMore != null && !topLoading && (
                <button
                    className="flex items-center gap-x-2 mx-auto text-white/75 hover:text-white/100"
                    onClick={loadMoreOnTop}
                >
                    <IoReloadOutline />
                    Load more
                </button>
            )}
            <div ref={top_ref}></div>
            {children}
            <div ref={bottom_ref}></div>
            {manualLoadButtons && bottomHasMore != null && !bottomLoading && (
                <button
                    className="flex items-center gap-x-2 mx-auto text-white/75 hover:text-white/100"
                    onClick={loadMoreOnBottom}
                >
                    <IoReloadOutline />
                    Load more
                </button>
            )}
            {loadingMessage && bottomLoading && (
                <div className="flex gap-x-2 items-center mx-auto">
                    <div className="h-6 w-6 relative">
                        <OverlayLoadingSpinner />
                    </div>
                    <div className="text-xs">Loading ...</div>
                </div>
            )}
        </ul>
    );
}
