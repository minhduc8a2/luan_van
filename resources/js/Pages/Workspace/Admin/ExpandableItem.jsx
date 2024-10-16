import Button from "@/Components/Button";
import React, { useState } from "react";

export default function ExpandableItem({ header, children }) {
    const [expanded, setExpanded] = useState(false);
    function toggleExpanded() {
        setExpanded((pre) => !pre);
    }
    return (
        <div>
            <div className="flex justify-between">
                {header}
                <Button onClick={toggleExpanded} className="h-fit">
                    {" "}
                    {expanded ? "Close" : "Expand"}
                </Button>
            </div>

            {expanded && children}
        </div>
    );
}
