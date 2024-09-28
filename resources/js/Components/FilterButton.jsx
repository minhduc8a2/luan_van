import { Popover, PopoverButton, PopoverPanel } from "@headlessui/react";
import React, { useState } from "react";
import { FaCheck, FaChevronDown } from "react-icons/fa";

export default function FilterButton({ list, action }) {
    const [selectedValue, setSelectedValue] = useState(list[0]);

    return (
        <Popover className="relative ">
            <PopoverButton
                className={`border flex items-center gap-x-2 rounded font-bold text-sm border-white/15 px-2 py-1 bg-background ${
                    selectedValue.value == list[0].value ? "" : "bg-link"
                }`}
            >
                {selectedValue.title} <FaChevronDown className="text-xs" />
            </PopoverButton>
            <PopoverPanel
                anchor="bottom"
                className="flex flex-col py-2 rounded-lg bg-foreground w-64 border border-white/15  "
            >
                {({ close }) => (
                    <>
                        {list.map((item) => (
                            <button
                                className={`hover:bg-blue-500 group  flex gap-x-2 items-center  w-full p-1 px-4 text-left ${
                                    item.value == selectedValue.value
                                        ? "text-link "
                                        : ""
                                }`}
                                onClick={() => {
                                    setSelectedValue(item);

                                    action(item.value);
                                    close();
                                }}
                                key={item.value}
                            >
                                <FaCheck
                                    className={`group-hover:text-white text-xs ${
                                        selectedValue.value == item.value
                                            ? "visible"
                                            : "invisible"
                                    }`}
                                />
                                <div
                                    className={`group-hover:text-white ${
                                        item.value == selectedValue.value
                                            ? "group-hover:font-bold"
                                            : ""
                                    }`}
                                >
                                    {item.inside}
                                </div>
                            </button>
                        ))}
                    </>
                )}
            </PopoverPanel>
        </Popover>
    );
}
