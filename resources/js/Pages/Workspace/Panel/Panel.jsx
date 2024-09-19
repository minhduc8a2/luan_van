import { IoIosArrowDown } from "react-icons/io";
import { HiOutlinePencilAlt } from "react-icons/hi";
import { BiMessageRoundedDetail } from "react-icons/bi";
import { FaCaretDown } from "react-icons/fa";
import { LuLock } from "react-icons/lu";

import { router, usePage } from "@inertiajs/react";
import { InvitationForm } from "./InvitationForm";
import { DirectChannel } from "./DirectChannel";
import { useDispatch, useSelector } from "react-redux";
import Activity from "./Activity/Activity";
import { CreateChannelForm } from "./createChannelForm";
import { FiArchive } from "react-icons/fi";
import { setThreadMessage } from "@/Store/threadSlice";
import { useEffect, useRef, useState } from "react";
import { setPanelWidth } from "@/Store/panelSlice";

export default function Panel({}) {
    const {
        auth,
        channel: currentChannel,
        workspace,
        channels = [],
        users,
        directChannels = [],
        selfChannel,
        permissions,
    } = usePage().props;
    const { type, width } = useSelector((state) => state.panel);
    const dispatch = useDispatch();
    const panelRef = useRef(null);
    const isDraggingRef = useRef(null);
    const newMessageCountsMap = useSelector(
        (state) => state.newMessageCountsMap
    );
    // const { messages } = useSelector((state) => state.messages);
    function changeChannel(channel) {
        dispatch(setThreadMessage(null));
        router.get(
            route("channel.show", channel.id),
            {},
            { preserveState: true }
        );
    }
    if (type == "activity") return <Activity />;

    useEffect(() => {
        let x = 0;
        let styles = window.getComputedStyle(panelRef.current);
        let width = parseInt(styles.width);
        const onMouseMoveRightResize = (e) => {
            if (!isDraggingRef.current) return;
            const dx = e.clientX - x;
            x = e.clientX;
            width += dx;

            dispatch(setPanelWidth(width));
        };
        const onMouseUp = () => {
            isDraggingRef.current = false;
        };
        const onMouseDown = (e) => {
            x = e.clientX;
            isDraggingRef.current = true;
        };

        //listeners
        document.addEventListener("mousemove", onMouseMoveRightResize);

        document.addEventListener("mouseup", onMouseUp);

        document.addEventListener("mousedown", onMouseDown);
        return () => {
            document.removeEventListener("mousemove", onMouseMoveRightResize);

            document.removeEventListener("mouseup", onMouseUp);

            document.removeEventListener("mousedown", onMouseDown);
        };
    }, []);
    return (
        <div
            ref={panelRef}
            style={{ width }}
            className="bg-secondary h-full relative rounded-l-lg rounded-s-lg border-r border-r-white/15"
        >
            <div
                className={`bg-transparent transition hover:bg-link w-1 cursor-col-resize h-full absolute top-0 right-0`}
            ></div>
            <div className="flex justify-between items-center p-4">
                <div className="flex gap-x-1 items-center">
                    <h3 className="text-xl font-semibold">{workspace.name}</h3>
                    <IoIosArrowDown className="text-lg" />
                </div>
                <HiOutlinePencilAlt className="text-xl opacity-75" />
            </div>
            <hr className=" opacity-10" />
            <div className="opacity-85 pl-4 pr-4 pt-4">
                <div className=" grid-item  px-4">
                    <BiMessageRoundedDetail className="text-xl" />
                    <div className="">Threads</div>
                </div>
                <div className="mt-6">
                    <div className="grid-item  px-4">
                        <div className="flex items-center">
                            <FaCaretDown className="text-lg" />
                        </div>
                        <div className="">Channels</div>
                    </div>
                    <ul className="max-h-[30vh] overflow-y-auto scrollbar">
                        {channels.map((channel) => {
                            if (channel.type === "PUBLIC")
                                return (
                                    <li key={channel.id}>
                                        <button
                                            onClick={() =>
                                                changeChannel(channel)
                                            }
                                            className={`flex items-center mt-2 w-full px-4 justify-between rounded-lg ${
                                                channel.id == currentChannel.id
                                                    ? "bg-primary-lighter"
                                                    : "hover:bg-white/10"
                                            }`}
                                        >
                                            {channel.is_archived ? (
                                                <div className="grid-item">
                                                    <div className="flex items-center h-full justify-center">
                                                        <FiArchive className="text-sm " />
                                                    </div>
                                                    <div className="font-semibold flex items-center leading-7">
                                                        {channel.name}
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="grid-item">
                                                    <div className="text-lg">
                                                        #
                                                    </div>
                                                    <div className="flex items-center">
                                                        {channel.name}
                                                    </div>
                                                </div>
                                            )}
                                            <div className="text-sm text-white">
                                                {newMessageCountsMap[channel.id]
                                                    ? newMessageCountsMap[
                                                          channel.id
                                                      ]
                                                    : ""}
                                            </div>
                                        </button>
                                    </li>
                                );
                            else if (channel.type === "PRIVATE")
                                return (
                                    <li key={channel.id}>
                                        <button
                                            onClick={() =>
                                                changeChannel(channel)
                                            }
                                            className={`flex items-center justify-between mt-2 px-4 w-full rounded-lg ${
                                                channel.id == currentChannel.id
                                                    ? "bg-primary-lighter"
                                                    : "hover:bg-white/10"
                                            }`}
                                        >
                                            <div className="grid-item">
                                                <div className="flex items-center h-full justify-center">
                                                    {channel.is_archived ? (
                                                        <FiArchive className="text-sm " />
                                                    ) : (
                                                        <LuLock className="text-sm " />
                                                    )}
                                                </div>
                                                <div className="font-semibold flex items-center leading-7">
                                                    {channel.name}
                                                </div>
                                            </div>
                                            <div className="text-sm text-white">
                                                {newMessageCountsMap[channel.id]
                                                    ? newMessageCountsMap[
                                                          channel.id
                                                      ]
                                                    : ""}
                                            </div>
                                        </button>
                                    </li>
                                );
                            else return "";
                        })}
                    </ul>
                    <CreateChannelForm />
                </div>
                <div className="mt-6">
                    <div className="grid-item px-4">
                        <div className="flex items-center ">
                            <FaCaretDown className="text-lg" />
                        </div>
                        <div className="">Direct messages</div>
                    </div>
                    <ul className="max-h-[30vh] overflow-y-auto scrollbar">
                        {directChannels.map((directCn) => {
                            const userIds = directCn.name.split("_");
                            const userId = userIds.find(
                                (id) => id != auth.user.id
                            );
                            let user;
                            if (userId)
                                user = users.find((u) => u.id == userId);
                            return (
                                <DirectChannel
                                    key={user.id}
                                    user={user}
                                    channel={directCn}
                                />
                            );
                        })}
                        <DirectChannel
                            isOnline={true}
                            user={{ ...auth.user, online: true }}
                            channel={selfChannel}
                        />
                    </ul>
                    <InvitationForm workspace={workspace} />
                </div>
            </div>
        </div>
    );
}
