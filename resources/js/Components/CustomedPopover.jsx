import React from "react";
import {
    Popover,
    PopoverButton,
    PopoverPanel,
  
} from "@headlessui/react";
function CustomedPopover({
    triggerNode,
    children,

    anchor = "",
}) {
   
    return (
        <Popover className="relative">
            <PopoverButton className="!outline-none">
                {triggerNode}
            </PopoverButton>
            <PopoverPanel
                anchor={anchor}
                className="flex flex-col w-96 border border-white/15 rounded-lg bg-background py-3"
            >
                {children}
            </PopoverPanel>
        </Popover>
    );
}

function ListItem({ children, onClick }) {
    return (
        <div
            className="hover:bg-link text-white/85 px-4 py-1 cursor-pointer"
            onClick={() => {
                onClick();
                
            }}
        >
            {children}
        </div>
    );
}

CustomedPopover.ListItem = ListItem;
export default CustomedPopover;
