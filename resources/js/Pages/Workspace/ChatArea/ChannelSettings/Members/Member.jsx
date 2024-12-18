import { IoMdMore } from "react-icons/io";
import { useSelector } from "react-redux";

import { router, useForm, usePage } from "@inertiajs/react";
import React, { useMemo } from "react";

import AvatarAndName from "@/Components/AvatarAndName";
import { useState } from "react";
import {
    Popover,
    PopoverButton,
    PopoverPanel,
    CloseButton,
} from "@headlessui/react";
import { useChannel, useChannelData, useManagers } from "@/helpers/customHooks";
import { useParams } from "react-router-dom";

export default function Member({
    user,
    makeChannelManager,
    removeFromChannel,
    removeChannelManager,
}) {
    const {channelId} = useParams()

    const { managers } = useManagers(channelId);
    const { permissions } = useChannelData(channelId);
    const { channel } = useChannel(channelId);
    const [showOptions, setShowOptions] = useState(false);
    const onlineStatusMap = useSelector((state) => state.onlineStatus);
    const isManager = useMemo(() => {
        return managers.some((m) => m.id == user.id);
    }, [user, managers]);

    return (
        <div
            className={`px-6 py-4 flex justify-between relative items-center group hover:bg-color/15 ${
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
            {(permissions.removeManager ||
                permissions.addManagers ||
                permissions.removeUserFromChannel) && (
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
                                        className=" p-1 bg-background border border-color/15 rounded-lg"
                                        onClick={() => setShowOptions(true)}
                                    >
                                        <IoMdMore className="text-xl" />
                                    </div>
                                </PopoverButton>
                                <PopoverPanel
                                    anchor="bottom end"
                                    className="flex flex-col bg-background border border-color/15 py-2 rounded-lg text-color-high-emphasis"
                                >
                                    {isManager
                                        ? permissions.removeManager && (
                                              <CloseButton
                                                  className="p-2 px-4 text-start hover:bg-color/15"
                                                  onClick={() =>
                                                      removeChannelManager(user)
                                                  }
                                              >
                                                  Remove from Channel Manager
                                              </CloseButton>
                                          )
                                        : permissions.addManagers && (
                                              <CloseButton
                                                  className="p-2 px-4 text-start hover:bg-color/15"
                                                  onClick={() =>
                                                      makeChannelManager(user)
                                                  }
                                              >
                                                  Make Channel Manager
                                              </CloseButton>
                                          )}
                                    {!channel.is_main_channel &&
                                        permissions.removeUserFromChannel && (
                                            <CloseButton
                                                className="p-2 px-4 text-start hover:bg-danger-500 "
                                                onClick={() =>
                                                    removeFromChannel(user)
                                                }
                                            >
                                                Remove from Channel
                                            </CloseButton>
                                        )}
                                </PopoverPanel>
                            </>
                        );
                    }}
                </Popover>
            )}
        </div>
    );
}
