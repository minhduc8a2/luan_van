import React from "react";

export default function Tooltip({ content, children }) {
    return (
        <div className="group/tooltip relative">
            <div className="">{children}</div>
            {content && (
                <div className="group-hover/tooltip:block hidden absolute top-0 -translate-y-full -mt-2 left-1/2 -translate-x-1/2  p-1 px-2 rounded-lg border border-white/15  bg-background ">
                    {content}
                </div>
            )}{" "}
        </div>
    );
}
