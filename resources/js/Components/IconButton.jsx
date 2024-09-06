import React from "react";
import { useState } from "react";
import Tooltip from "./Tooltip";

export default function IconButton({
    selfActive = true,
    show,
    className = "",
    children,
    activeIconNode = null,
    onClick = () => {},
    description = "",
    activeDescription = "",
    activable = true,
    initActiveState = false,
    ...props
}) {
    const [active, setActive] = useState(initActiveState);

    return (
        <Tooltip
            content={
                (description &&
                    (!(selfActive ? active : show) || !activable) && (
                        <p className="text-sm  whitespace-nowrap">{description}</p>
                    )) ||
                (activeDescription &&
                    (selfActive ? active : show) &&
                    activable && (
                        <p className="text-sm whitespace-nowrap">{activeDescription}</p>
                    ))
            }
        >
            <div
                onClick={() => {
                    if (selfActive) setActive((pre) => !pre);
                    onClick();
                }}
                className={`p-3 rounded-full bg-white/10  ${
                    (selfActive ? active : show) && activable
                        ? "bg-white/50"
                        : "hover:bg-white/25"
                } ${className}`}
                {...props}
            >
                {((activeIconNode != null && !(selfActive ? active : show)) ||
                    activeIconNode == null) &&
                    children}
                {(selfActive ? active : show) && activable && activeIconNode}
            </div>
        </Tooltip>
    );
}
