import { setLeftWindowWidth } from "@/Store/sizeSlice";
import React, { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";

export default function LeftWindow({ children }) {
    const containerRef = useRef(null);
    const dispatch = useDispatch();
    const { leftWindowWidth } = useSelector((state) => state.size);
    const isDraggingRef = useRef(null);
    const draggingBarRef = useRef(null);
    useEffect(() => {
        let x = 0;
        let styles = window.getComputedStyle(containerRef.current);
        let width = parseInt(styles.width);
        const onMouseMoveRightResize = (e) => {
            if (!isDraggingRef.current) return;
            const dx = e.clientX - x;
            x = e.clientX;
            width += dx;

            dispatch(setLeftWindowWidth(width));
        };
        const onMouseUp = (e) => {
            isDraggingRef.current = false;
        };
        const onMouseDown = (e) => {
            if (e.target != draggingBarRef.current) return;
            x = e.clientX;
            isDraggingRef.current = true;
        };

        //listeners
        document.addEventListener("mousemove", onMouseMoveRightResize);

        document.addEventListener("mouseup", onMouseUp);

        document.addEventListener("mousedown", onMouseDown);
        return () => {
            document.removeEventListener("mousemove", onMouseMoveRightResize);

            document.removeEventListener("mouseup", onMouseUp);

            document.removeEventListener("mousedown", onMouseDown);
        };
    }, []);

    return (
        <div
            ref={containerRef}
            style={{ width: children ? leftWindowWidth : 0 }}
            className="relative"
        >
            <div
                ref={draggingBarRef}
                className={`bg-transparent transition z-20 hover:bg-link w-1 cursor-col-resize h-full absolute top-0 right-0`}
            ></div>
            {children}
        </div>
    );
}
