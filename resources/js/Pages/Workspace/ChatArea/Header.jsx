import React, { useState } from "react";
import ChannelSettings from "./ChannelSettings/ChannelSettings";
import {  FaPlus } from "react-icons/fa";
import Avatar from "@/Components/Avatar";
import { FiHeadphones } from "react-icons/fi";
import { CgFileDocument } from "react-icons/cg";
import { usePage } from "@inertiajs/react";
import { useDispatch, useSelector } from "react-redux";

import { toggleHuddle } from "@/Store/huddleSlice";
import {
    useChannel,
    useChannelData,
    useChannelUsers,
} from "@/helpers/customHooks";
import { useParams } from "react-router-dom";
import LoadingSpinner from "@/Components/LoadingSpinner";
import CustomedDialog from "@/Components/CustomedDialog";

export default function Header({
    channelName,
    loaded,
    topLoading,
    bottomLoading,
}) {
    const { auth } = usePage().props;
    const { channelId } = useParams();
    const { channelId: huddleChannelId } = useSelector((state) => state.huddle);
    const { channel } = useChannel(channelId);

    const { permissions } = useChannelData(channelId);
    const { channelUsers } = useChannelUsers(channelId);
    const [isOpen, setIsOpen] = useState(false);
    const dispatch = useDispatch();
    function handleHuddleButtonClicked() {
        if (huddleChannelId && huddleChannelId != channel.id) {
            if (confirm("Are you sure you want to switch to other huddle"))
                dispatch(
                    toggleHuddle({
                        channelId: channel.id,
                        userId: auth.user.id,
                    })
                );
        } else {
            dispatch(
                toggleHuddle({
                    channelId: channel.id,

                    userId: auth.user.id,
                })
            );
        }
    }
    return (
        <div
            className={`p-4 border-b border-b-color/10 text-color-high-emphasis z-10 ${
                loaded ? "" : "animate-pulse"
            }`}
        >
            <div className="flex justify-between font-bold text-lg opacity-75">
                <div className="relative">
                    <ChannelSettings channelName={channelName} />
                    {(topLoading || bottomLoading) && (
                        <div className="flex  gap-x-2 items-center px-4 py-2 absolute left-full top-1/2 -translate-y-1/2">
                            <div className="h-6 w-6 relative">
                                <LoadingSpinner />
                            </div>
                            <div className="text-xs text-nowrap">
                                Loading ...
                            </div>
                        </div>
                    )}
                </div>
                <div className="">
                    {!channel?.is_archived && (
                        <div className="flex items-center gap-x-4 ">
                            <div className="flex items-center p-1 border  border-color/15 rounded-lg px-2">
                                <ul className="flex">
                                    {channelUsers.map((user) => (
                                        <li
                                            key={user.id}
                                            className="-ml-2 first:ml-0  "
                                        >
                                            <Avatar
                                                src={user.avatar_url}
                                                noStatus={true}
                                                className="w-6 h-6 border-2  border-background"
                                                roundedClassName="rounded-lg"
                                            />
                                        </li>
                                    ))}
                                </ul>

                                <div className="text-xs ml-2">
                                    {channelUsers.length}
                                </div>
                            </div>
                            <div
                                className={`flex items-center p-1 border border-color/15 rounded-lg px-2 gap-x-3 font-normal  ${
                                    huddleChannelId ? "bg-green-700 text-white" : " "
                                }`}
                            >
                                {permissions?.huddle ? (
                                    <button
                                        className={`flex items-center gap-x-1 `}
                                        onClick={handleHuddleButtonClicked}
                                    >
                                        <FiHeadphones className="text-xl" />
                                        <div className={`text-sm `}>Huddle</div>
                                    </button>
                                ) : (
                                    <>
                                        <button
                                            className={`flex items-center gap-x-1 `}
                                            onClick={() => setIsOpen(true)}
                                        >
                                            <FiHeadphones className="text-xl" />
                                            <div className={`text-sm `}>
                                                Huddle
                                            </div>
                                        </button>
                                        <CustomedDialog
                                            isOpen={isOpen}
                                            onClose={() => setIsOpen(false)}
                                        >
                                            <h5 className="mb-4  ">
                                                You're not allowed to huddle in
                                                channel. Contact Admins or
                                                Channel managers for more
                                                information!
                                            </h5>
                                            <CustomedDialog.CloseButton />
                                        </CustomedDialog>
                                    </>
                                )}
                                {/* <div className="flex items-center gap-x-1">
              <span className="text-sm opacity-25 ">|</span>
              <FaAngleDown className="text-xs" />
          </div> */}
                            </div>

                            <div className="p-1 border border-color/15 rounded-lg ">
                                <CgFileDocument className="text-xl" />
                            </div>
                        </div>
                    )}
                </div>
            </div>
            <div className="flex items-center gap-x-2 opacity-75 mt-4">
                <FaPlus className="text-xs" />
                <div className="text-sm">Add bookmarks</div>
            </div>
        </div>
    );
}
