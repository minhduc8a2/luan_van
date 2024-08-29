import React from "react";

export default function Tooltip({ content, children }) {
    return (
        <div className="group ">
            <div className="anchor">{children}</div>
            {content && (
                <div className="group-hover:block hidden tooltip p-2 rounded-lg bg-background ">
                    {content}
                </div>
            )}{" "}
        </div>
    );
}
