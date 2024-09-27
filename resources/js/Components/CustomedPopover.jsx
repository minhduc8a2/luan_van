import React from "react";
import {
    Popover,
    PopoverButton,
    PopoverPanel,
    CloseButton,
    useClose,
} from "@headlessui/react";
function CustomedPopover({
    triggerNode,
    children,
    width = "w-96",
    anchor = "",
    className=""
}) {
    return (
        <Popover className="relative">
            <PopoverButton className="!outline-none">
                {triggerNode}
            </PopoverButton>
            <PopoverPanel
                anchor={anchor}
                className={`flex flex-col ${width} border border-white/15 rounded-lg bg-background py-3 ${className}`}
            >
                {children}
            </PopoverPanel>
        </Popover>
    );
}

function ListItem({ children, onClick, className }) {
    const close = useClose();
    return (
        <div
            className={
                "hover:bg-link text-white/85 px-4 py-1 cursor-pointer " +
                className
            }
            onClick={() => {
                onClick();
                close();
            }}
        >
            {children}
        </div>
    );
}

CustomedPopover.ListItem = ListItem;
export default CustomedPopover;
