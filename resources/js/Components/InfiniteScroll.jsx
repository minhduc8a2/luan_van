import React, { useEffect, useRef, useState } from "react";
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
    showManualLoadButtons = false,
    showLoadingMessage = false,
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
    const [justTopLoaded, setJustTopLoaded] = useState(false);
    const preScrollPositionRef = useRef(null);
    useEffect(() => {
        if (topHasMore && !topLoading && top_inView) {
            console.log("Load more on top");
            setJustTopLoaded(false);
            preScrollPositionRef.current = {
                oldScrollHeight: containerRef.current.scrollHeight,
                oldScrollTop: containerRef.current.scrollTop,
            };
            loadMoreOnTop().then(() => {
                setJustTopLoaded(true);
            });
        }
    }, [top_inView, topHasMore, topLoading]);

    useEffect(() => {
        if (justTopLoaded) {
            containerRef.current.scrollTop =
                containerRef.current.scrollHeight -
                preScrollPositionRef.current.oldScrollHeight +
                preScrollPositionRef.current.oldScrollTop;
            setJustTopLoaded(false);
        }
    }, [justTopLoaded]);

    useEffect(() => {
        if (bottomHasMore && !bottomLoading && bottom_inView) {
            loadMoreOnBottom();
            console.log("load more on bottom");
        }
    }, [bottom_inView, bottomHasMore, bottomLoading]);
    return (
        <ul className={className} ref={containerRef}>
            {showLoadingMessage && topLoading && (
                <div className="flex gap-x-2 items-center px-4 py-2">
                    <div className="h-6 w-6 relative">
                        <OverlayLoadingSpinner />
                    </div>
                    <div className="text-xs">Loading ...</div>
                </div>
            )}
            {showManualLoadButtons && topHasMore != null && !topLoading && (
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
            {showManualLoadButtons &&
                bottomHasMore != null &&
                !bottomLoading && (
                    <button
                        className="flex items-center gap-x-2 mx-auto text-white/75 hover:text-white/100"
                        onClick={loadMoreOnBottom}
                    >
                        <IoReloadOutline />
                        Load more
                    </button>
                )}
            {showLoadingMessage && bottomLoading && (
                <div className="flex gap-x-2 items-center px-4 py-2 mx-auto">
                    <div className="h-6 w-6 relative">
                        <OverlayLoadingSpinner />
                    </div>
                    <div className="text-xs">Loading ...</div>
                </div>
            )}
        </ul>
    );
}
