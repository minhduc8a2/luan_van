import { useDispatch, useSelector } from "react-redux";

import { useEffect, useRef } from "react";
import { setRightWindowWidth } from "@/Store/sizeSlice";

export default function RightWindow({ children }) {
    const dispatch = useDispatch();

    const containerRef = useRef(null);
    const isDraggingRef = useRef(null);
    const { rightWindowWidth } = useSelector((state) => state.size);
    const draggingBarRef = useRef(null);

    useEffect(() => {
        let x = 0;
        let styles = window.getComputedStyle(containerRef.current);
        let width = parseInt(styles.width);
        const onMouseMoveRightResize = (e) => {
            if (!isDraggingRef.current) return;
            const dx = e.clientX - x;
            x = e.clientX;
            width -= dx;

            dispatch(setRightWindowWidth(width));
        };
        const onMouseUp = (e) => {
            // if (e.target != draggingBarRef.current) return;

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
            className=" bg-background flex flex-col relative border-l border-white/15"
            style={{ width:  rightWindowWidth  }}
            ref={containerRef}
        >
            <div
                ref={draggingBarRef}
                className={`bg-transparent transition hover:bg-link w-1 cursor-col-resize h-full absolute top-0 left-0`}
            ></div>
            {children}
        </div>
    );
}
