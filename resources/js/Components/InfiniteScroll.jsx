import React, { forwardRef, useEffect, useRef, useState } from "react";
import { IoReloadOutline } from "react-icons/io5";
import { useInView } from "react-intersection-observer";
import LoadingSpinner from "./LoadingSpinner";

const InfiniteScroll = forwardRef(function (
    {
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
        reverse = false,
        rootMargin = "500px",
        scrollToItem = null,
        threshold = 0.1,
    },
    containerRef
) {
    const { ref: top_ref, inView: top_inView } = useInView({
        threshold,
        root: containerRef.current,
        rootMargin,
    });
    const { ref: bottom_ref, inView: bottom_inView } = useInView({
        threshold,
        root: containerRef.current,
        rootMargin,
    });
    const [justTopLoaded, setJustTopLoaded] = useState(false);
    const preScrollPositionRef = useRef(null);

    useEffect(() => {
        console.log("top_inView", top_inView);

        if (topHasMore && !topLoading && top_inView) {
            console.log("Load more on top");
            if (!reverse) {
                setJustTopLoaded(false);
            }

            loadMoreOnTop(() => {
                if (!reverse) {
                    preScrollPositionRef.current = {
                        oldScrollHeight:
                            containerRef.current?.scrollHeight || 0,
                        oldScrollTop: containerRef.current?.scrollTop || 0,
                    };

                    if (!scrollToItem) setJustTopLoaded(true);
                }
            });
        }
    }, [top_inView, topHasMore, topLoading, scrollToItem]);

    useEffect(() => {
        if (justTopLoaded) {
            console.log("persist top scroll");
            containerRef.current.scrollTop =
                containerRef.current.scrollHeight -
                preScrollPositionRef.current?.oldScrollHeight +
                preScrollPositionRef.current?.oldScrollTop;
            setJustTopLoaded(false);
        }
    }, [justTopLoaded]);

    useEffect(() => {
        console.log("bottom_inView", bottom_inView);
        if (bottomHasMore && !bottomLoading && bottom_inView) {
            console.log("load more on bottom");
            if (reverse) {
                setJustTopLoaded(false);
            }

            loadMoreOnBottom(() => {
                if (reverse) {
                    preScrollPositionRef.current = {
                        oldScrollHeight:
                            containerRef.current?.scrollHeight || 0,
                        oldScrollTop: containerRef.current?.scrollTop || 0,
                    };

                    if (!scrollToItem) setJustTopLoaded(true);
                }
            });
        }
    }, [bottom_inView, bottomHasMore, bottomLoading, scrollToItem]);

    function ButtonLoading({ position }) {
        if (position == "top") {
            return (
                <>
                    {showLoadingMessage && topLoading && (
                        <div className="flex gap-x-2 items-center px-4 py-2">
                            <div className="h-6 w-6 relative">
                                <LoadingSpinner />
                            </div>
                            <div className="text-xs">Loading ...</div>
                        </div>
                    )}
                    {showManualLoadButtons &&
                        topHasMore != null &&
                        !topLoading && (
                            <button
                                className="flex items-center gap-x-2 mx-auto text-white/75 hover:text-white/100"
                                onClick={loadMoreOnTop}
                            >
                                <IoReloadOutline />
                                Load more
                            </button>
                        )}
                </>
            );
        } else {
            return (
                <>
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
                                <LoadingSpinner />
                            </div>
                            <div className="text-xs">Loading ...</div>
                        </div>
                    )}
                </>
            );
        }
    }
    return (
        <ul className={className} ref={containerRef}>
            <ButtonLoading position={!reverse ? "top" : "bottom"} />
            <div ref={reverse ? bottom_ref : top_ref}></div>
            {children}
            <div ref={!reverse ? bottom_ref : top_ref}></div>
            <ButtonLoading position={reverse ? "top" : "bottom"} />
        </ul>
    );
});
export default InfiniteScroll;
