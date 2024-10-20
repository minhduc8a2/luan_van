import React, { forwardRef, useState } from "react";
import { IoSearchSharp } from "react-icons/io5";

const SimpleSearchInput = forwardRef(
    (
        {
            width = "w-full",
            className = "",
            onFocus = () => {},
            onBlur = () => {},

            ...props
        },
        ref
    ) => {
        const [focused, setFocused] = useState(false);
        return (
            <div
                className={`flex gap-x-2  items-center h-fit  border-color/15 bg-transparent text-color-high-emphasis px-3 py-2  border  rounded-xl shadow-sm ${width} ${
                    focused ? "ring-4 ring-link/50 border-link" : ""
                } ${className}`}
            >
                <IoSearchSharp className="text-lg text-color-medium-emphasis" />
                <input
                    ref={ref}
                    className="border-none p-0 focus:ring-0 flex-1 bg-transparent"
                    {...props}
                    onFocus={(e) => {
                        setFocused(true);
                        onFocus(e);
                    }}
                    onBlur={(e) => {
                        setFocused(false);
                        onBlur(e);
                    }}
                ></input>
            </div>
        );
    }
);
export default SimpleSearchInput;
