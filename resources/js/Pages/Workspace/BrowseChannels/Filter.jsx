import React, { useState } from "react";
import { Popover, PopoverButton, PopoverPanel } from "@headlessui/react";
import { FaChevronDown, FaLock } from "react-icons/fa";
import { FaCheck } from "react-icons/fa";
import { FaBoxArchive } from "react-icons/fa6";
import FilterButton from "@/Components/FilterButton";
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
                    initialValue={null}
                />
                <FilterButton
                    list={privacyTypes}
                    action={(value) => {
                        setFilter((pre) => ({ ...pre, privacyType: value }));
                    }}
                    initialValue={null}
                />
            </div>
            <FilterButton
                list={sortTypes}
                action={(value) => {
                    setFilter((pre) => ({ ...pre, sort: value }));
                }}
                initialValue={sortTypes[2]}
            />
        </div>
    );
}

