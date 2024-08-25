import React from "react";
import { useState, useRef, useEffect } from "react";
import { IoMdCloseCircle } from "react-icons/io";

export default function SquareImage({
    size = "h-20",
    url,
    removable = false,
    remove = () => {},
}) {
    const [dimensions, setDimensions] = useState(null);
    const imgRef = useRef(null);
    useEffect(() => {
        imgRef.current.src = url;
        imgRef.current.onload = () => {
            URL.revokeObjectURL(url);
            let width = imgRef.current.naturalWidth;
            let height = imgRef.current.naturalHeight;

            setDimensions({ height, width });
        };
    }, []);
    return (
        <div className=" relative group">
            {removable && (
                <button
                    className="absolute -top-1 -right-1 z-20"
                    onClick={() => remove()}
                >
                    <IoMdCloseCircle className="text-base drop-shadow hidden group-hover:block " />
                </button>
            )}
            <div
                className={` aspect-square overflow-hidden flex justify-center items-center rounded-lg group-hover:brightness-50   ${size}`}
            >
                <img
                    src=""
                    alt=""
                    ref={imgRef}
                    className={`  ${dimensions ? "" : "hidden"} ${
                        dimensions && dimensions.height >= dimensions.width
                            ? "w-full"
                            : "h-full"
                    }`}
                />
            </div>
        </div>
    );
}