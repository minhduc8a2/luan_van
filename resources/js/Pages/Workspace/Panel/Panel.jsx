import { IoIosArrowDown } from "react-icons/io";
import { HiOutlinePencilAlt } from "react-icons/hi";
import { BiMessageRoundedDetail } from "react-icons/bi";
import { FaCaretDown } from "react-icons/fa";
import { LuLock } from "react-icons/lu";

import { router, usePage } from "@inertiajs/react";
import { InvitationForm } from "./InvitationForm";
import { DirectChannel } from "./DirectChannel";
import { useSelector } from "react-redux";
import Activity from "./Activity/Activity";
import { CreateChannelForm } from "./createChannelForm";
import { FiArchive } from "react-icons/fi";

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
    const { type } = useSelector((state) => state.panel);
    const newMessageCountsMap = useSelector(
        (state) => state.newMessageCountsMap
    );
    // const { messages } = useSelector((state) => state.messages);
    function changeChannel(channel) {
        router.get(
            route("channel.show", channel.id),
            {},
            { preserveState: true }
        );
    }
    if (type == "activity") return <Activity />;

    return (
        <div className="bg-secondary h-full rounded-l-lg rounded-s-lg ">
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
                    <ul>
                        {channels.map((channel) => {
                            console.log(channel);
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
                    <ul>
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
