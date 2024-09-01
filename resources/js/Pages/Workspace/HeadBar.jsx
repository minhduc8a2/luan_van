import { usePage } from "@inertiajs/react";
import React from "react";
import { IoIosSearch } from "react-icons/io";
import { IoArrowBack } from "react-icons/io5";
import { IoArrowForward } from "react-icons/io5";


export default function HeadBar() {
    const { workspace } = usePage().props;

    return (
        <div className="flex items-center h-full">
            <div className="flex w-1/2 mx-auto items-center gap-x-6">
                <div className="flex gap-x-2 ">
                    <IoArrowBack className="text-lg" />
                    <IoArrowForward className="text-lg" />
                </div>
                <div className="flex justify-between bg-white/25 p-1 px-2 flex-1 rounded-lg  items-center">
                    <div className="text-sm">Search {workspace.name}</div>
                    <IoIosSearch className="text-lg" />
                </div>
            </div>
        </div>
    );
}
