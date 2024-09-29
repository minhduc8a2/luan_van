import React, { useMemo } from "react";
import ChannelSettings from "./ChannelSettings/ChannelSettings";
import { FaAngleDown, FaLock, FaPlus } from "react-icons/fa";
import Avatar from "@/Components/Avatar";
import { FiHeadphones } from "react-icons/fi";
import OverlayNotification from "@/Components/Overlay/OverlayNotification";
import { CgFileDocument } from "react-icons/cg";
import { usePage } from "@inertiajs/react";
import { useDispatch, useSelector } from "react-redux";

import { toggleHuddle } from "@/Store/huddleSlice";
export default function Header({ channelName }) {
    const {
        auth,
        channelId,

        channelUsers,

        permissions,
    } = usePage().props;
    const { channelId: huddleChannelId } = useSelector((state) => state.huddle);
    const { channels } = useSelector((state) => state.channels);

    const channel = useMemo(
        () => channels.find((cn) => cn.id == channelId),
        [channels, channelId]
    );
    const { workspaceUsers } = useSelector((state) => state.workspaceUsers);

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
        <div className="p-4 border-b border-b-white/10 z-10">
            <div className="flex justify-between font-bold text-lg opacity-75">
                <div className="flex items-center gap-x-4">
                    <ChannelSettings
                        channelName={channelName}
                        buttonNode={
                            <div className="flex items-center gap-x-2">
                                <div className="flex items-baseline gap-x-1">
                                    {channel.type == "PUBLIC" ? (
                                        <span className="text-xl">#</span>
                                    ) : (
                                        <FaLock className="text-sm inline" />
                                    )}{" "}
                                    {channelName}
                                </div>

                                <FaAngleDown className="text-sm" />
                            </div>
                        }
                    />
                </div>
                <div className="">
                    {!channel.is_archived && (
                        <div className="flex items-center gap-x-4 ">
                            <div className="flex items-center p-1 border  border-white/15 rounded-lg px-2">
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
                                className={`flex items-center p-1 border border-white/15 rounded-lg px-2 gap-x-3 font-normal  ${
                                    huddleChannelId ? "bg-green-700 " : ""
                                }`}
                            >
                                {permissions.huddle ? (
                                    <button
                                        className={`flex items-center gap-x-1 `}
                                        onClick={handleHuddleButtonClicked}
                                    >
                                        <FiHeadphones className="text-xl" />
                                        <div className={`text-sm `}>Huddle</div>
                                    </button>
                                ) : (
                                    <OverlayNotification
                                        buttonNode={
                                            <button
                                                className={`flex items-center gap-x-1 `}
                                            >
                                                <FiHeadphones className="text-xl" />
                                                <div className={`text-sm `}>
                                                    Huddle
                                                </div>
                                            </button>
                                        }
                                        className="p-3"
                                    >
                                        <h5 className="mb-4  ">
                                            You're not allowed to huddle in
                                            channel. Contact Admins or Channel
                                            managers for more information!
                                        </h5>
                                    </OverlayNotification>
                                )}
                                {/* <div className="flex items-center gap-x-1">
              <span className="text-sm opacity-25 ">|</span>
              <FaAngleDown className="text-xs" />
          </div> */}
                            </div>

                            <div className="p-1 border border-white/15 rounded-lg ">
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
