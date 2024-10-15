import React from "react";
import {
    Popover,
    PopoverButton,
    PopoverPanel,
    useClose,
} from "@headlessui/react";
function CustomedPopover({
    triggerNode,
    children,
    width = "w-96",
    anchor = "",
    className = "",
    setIsHovered = () => {},
    zIndex = "z-20"
}) {
    return (
        <Popover className="relative flex items-center">
            <PopoverButton className="!outline-none">
                {triggerNode}
            </PopoverButton>
            <PopoverPanel
                anchor={anchor}
                className={`flex flex-col  ${width} border border-color/15 rounded-lg bg-background py-3 ${className}`}
            >
                {({ close }) => (
                    <>
                        <div className={zIndex}>


                        {children}
                        </div>
                        <div
                            className="fixed top-0 bottom-0 right-0 left-0 bg-transparent overflow-hidden z-10"
                            onClick={() => {
                                console.log("object clicked");
                                close();
                                setIsHovered(false);
                            }}
                        ></div>
                    </>
                )}
            </PopoverPanel>
        </Popover>
    );
}

function ListItem({ children, onClick, className }) {
    const close = useClose();
    return (
        <div
            className={
                "hover:bg-link text-color-high-emphasis px-4 py-1 cursor-pointer " +
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
