import { IoMdMore } from "react-icons/io";
import { useSelector } from "react-redux";

import { router, useForm, usePage } from "@inertiajs/react";
import React, { useMemo } from "react";

import AvatarAndName from "@/Components/AvatarAndName";
import { useState } from "react";
import { Popover, PopoverButton, PopoverPanel } from "@headlessui/react";

export default function Member({ user }) {
    const { managers } = usePage().props;
    const [showOptions, setShowOptions] = useState(false);
    const onlineStatusMap = useSelector((state) => state.onlineStatus);
    const isManager = useMemo(() => {
        return managers.some((m) => m.id == user.id);
    }, [user.id]);

    
    return (
        <div
            className={`px-6 py-4 flex justify-between relative items-center group hover:bg-white/15 ${
                showOptions ? "bg-white/15" : ""
            }`}
        >
            <AvatarAndName
                className="h-10 w-10"
                user={user}
                isOnline={onlineStatusMap[user.id]}
            />
            {isManager && (
                <div className="px-2 py-1 rounded-full bg-white/10 text-xs">
                    Channel Manager
                </div>
            )}
            <Popover className="absolute right-4 top-1/2 -translate-y-1/2">
                {({ open }) => {
                    if (!open) setShowOptions(false);
                    return (
                        <>
                            <PopoverButton
                                className={` text-sm hover:underline ${
                                    showOptions ? "block" : "hidden"
                                } group-hover:block`}
                            >
                                <div
                                    className=" p-1 bg-background border border-white/50 rounded-lg"
                                    onClick={() => setShowOptions(true)}
                                >
                                    <IoMdMore className="text-xl" />
                                </div>
                            </PopoverButton>
                            <PopoverPanel
                                anchor="bottom end"
                                className="flex flex-col bg-background border border-white/25 py-2 rounded-lg text-white/85"
                            >
                                {isManager ? (
                                    <button className="p-2 px-4 text-start hover:bg-white/15">
                                        Remove from Channel Manager
                                    </button>
                                ) : (
                                    <button className="p-2 px-4 text-start hover:bg-white/15">
                                        Make Channel Manager
                                    </button>
                                )}
                                <button className="p-2 px-4 text-start hover:bg-danger">
                                    Remove from Channel
                                </button>
                            </PopoverPanel>
                        </>
                    );
                }}
            </Popover>
        </div>
    );
}
