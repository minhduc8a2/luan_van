import React, { useState } from "react";
import { Popover, PopoverButton, PopoverPanel } from "@headlessui/react";
import { FaChevronDown, FaLock } from "react-icons/fa";
import { FaCheck } from "react-icons/fa";
import { FaBoxArchive } from "react-icons/fa6";
export default function Filter({ setFilter }) {
    const ownTypes = [
        {
            inside: "All channels",
            title: "All channels",
            value: "all_channels",
        },
        {
            inside: "My channels",
            title: "My channels",
            value: "my_channels",
        },
        ,
        {
            inside: "Other channels",
            title: "Other channels",
            value: "other_channels",
        },
    ];
    const privacyTypes = [
        {
            inside: "Any channel type",
            title: "Any channel type",
            value: "any_channel_type",
        },
        {
            inside: (
                <div className="flex items-baseline gap-x-2">
                    <span className="text-xl">#</span>
                    Public
                </div>
            ),
            title: "Public",
            value: "public",
        },
        {
            inside: (
                <div className="flex items-baseline gap-x-2">
                    <FaLock className="text-sm inline" />
                    Private
                </div>
            ),
            title: "Private",
            value: "private",
        },
        {
            inside: (
                <div className="flex items-baseline gap-x-2">
                    <FaBoxArchive className="text-sm inline" />
                    Archived
                </div>
            ),
            title: "Archived",
            value: "archived",
        },
    ];
    const sortTypes = [
        {
            inside: "A to Z",
            title: "A to Z",
            value: "a_to_z",
        },
        {
            inside: "Z to A",
            title: "Z to A",
            value: "z_to_a",
        },
        {
            inside: "Newest channel",
            title: "Newest channel",
            value: "newest_channel",
        },
        {
            inside: "Oldest channel",
            title: "Oldest channel",
            value: "oldest_channel",
        },
        {
            inside: "Most members",
            title: "Most members",
            value: "most_members",
        },
        {
            inside: "Fewest members",
            title: "Fewest members",
            value: "fewest_members",
        },
    ];
    return (
        <div className="flex justify-between mt-8">
            <div className="flex gap-x-4">
                <FilterButton
                    list={ownTypes}
                    action={(value) => {
                        setFilter((pre) => ({ ...pre, ownType: value }));
                    }}
                />
                <FilterButton
                    list={privacyTypes}
                    action={(value) => {
                        setFilter((pre) => ({ ...pre, privacyType: value }));
                    }}
                />
            </div>
            <FilterButton
                list={sortTypes}
                action={(value) => {
                    setFilter((pre) => ({ ...pre, sort: value }));
                }}
            />
        </div>
    );
}

function FilterButton({ list, action }) {
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
