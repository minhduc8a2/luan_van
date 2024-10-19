import React from "react";
import { IoSearchSharp } from "react-icons/io5";

export default function SimpleSearchInput({
    width = "w-full",
    className = "",
    ...props
}) {
    return (
        <div
            className={`flex gap-x-2  items-center h-fit  border-color/15 bg-transparent text-color-high-emphasis px-3 py-2  border  rounded-xl shadow-sm ${width} focus:ring-4 focus:ring-link/50 focus:border-link ${className}`}
        >
            <IoSearchSharp className="text-lg text-color-medium-emphasis" />
            <input className="border-none p-0 focus:ring-0 flex-1 bg-transparent" {...props}></input>
        </div>
    );
}
