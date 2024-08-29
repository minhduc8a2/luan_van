import React from "react";
import { useState } from "react";
import Tooltip from "./Tooltip";

export default function IconButton({
    className = "",
    children,
    activeIconNode = null,
    onClick = () => {},
    description = "",
    activeDescription = "",
    activable = true,
    ...props
}) {
    const [active, setActive] = useState(false);

    return (
        <Tooltip
            content={
                (description && (!active || !activable) && (
                    <p className="text-sm max-w-36">{description}</p>
                )) ||
                (activeDescription && active && activable && (
                    <p className="text-sm max-w-36">{activeDescription}</p>
                ))
            }
        >
            <button
                onClick={() => {
                    setActive((pre) => !pre);
                    onClick();
                }}
                className={`p-3 rounded-full bg-white/10  ${
                    active && activable ? "bg-white/50" : "hover:bg-white/25"
                } ${className}`}
                {...props}
            >
                {((activeIconNode != null && !active) ||
                    activeIconNode == null) &&
                    children}
                {active &&activable && activeIconNode}
            </button>
        </Tooltip>
    );
}
