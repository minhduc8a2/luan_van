import React from "react";

export default function Tooltip({ content, children }) {
    return (
        <div className="group/tooltip ">
            <div className="anchor">{children}</div>
            {content && (
                <div className="group-hover/tooltip:block hidden tooltip p-1 px-2 rounded-lg border border-white/15  bg-background ">
                    {content}
                </div>
            )}{" "}
        </div>
    );
}
