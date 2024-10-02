import { IoIosArrowDown } from "react-icons/io";
import { HiOutlinePencilAlt } from "react-icons/hi";
import { BiMessageRoundedDetail } from "react-icons/bi";
import { FaCaretDown } from "react-icons/fa";
import { LuLock, LuPlus } from "react-icons/lu";

import { router, usePage } from "@inertiajs/react";
import { InvitationForm } from "./InvitationForm";
import { DirectChannel } from "./DirectChannel";
import { useDispatch, useSelector } from "react-redux";

import { CreateChannelForm } from "./createChannelForm";
import { FiArchive } from "react-icons/fi";

import { useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";

export default function Panel({}) {
    const { auth } = usePage().props;
    const { workspace } = useSelector((state) => state.workspace);
    const { channelId, workspaceId } = useParams();
    const navigate = useNavigate();
    const { channels } = useSelector((state) => state.channels);

    const currentChannel = useMemo(
        () => channels.find((cn) => cn.id == channelId),
        [channels, channelId]
    );

    const { workspaceUsers } = useSelector((state) => state.workspaceUsers);

    // const { messages } = useSelector((state) => state.messages);
    function changeChannel(channel) {
        navigate(`channels/${channel.id}`);
    }
    const directChannels = useMemo(() => {
        return channels.filter((cn) => cn.type == "DIRECT");
    }, [channels]);
    const selfChannel = useMemo(() => {
        return channels.find((cn) => cn.type == "SELF");
    }, [channels]);
    return (
        <div className="bg-black/35 h-full  rounded-l-lg rounded-s-lg border-r border-r-white/15">
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
                                                channel.id == currentChannel?.id
                                                    ? "bg-primary-300"
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
                                                {channel.unread_messages_count
                                                    ? channel.unread_messages_count
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
                                                channel.id == currentChannel?.id
                                                    ? "bg-primary-300"
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
                                                {channel.unread_messages_count
                                                    ? channel.unread_messages_count
                                                    : ""}
                                            </div>
                                        </button>
                                    </li>
                                );
                            else return "";
                        })}
                    </ul>
                    <CreateChannelForm
                        activateButtonNode={
                            <div className="grid-item mt-2 px-4">
                                <div className="flex items-center ">
                                    <LuPlus className="text-sm" />
                                </div>
                                <div className="">Add channels</div>
                            </div>
                        }
                    />
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
                            if (userId) {
                                user = workspaceUsers.find(
                                    (u) => u.id == userId
                                );
                            }
                            if (!user || user.is_hidden) return "";
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
