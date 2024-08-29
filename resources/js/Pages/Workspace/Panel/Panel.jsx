import React from "react";
import { IoIosArrowDown } from "react-icons/io";
import { HiOutlinePencilAlt } from "react-icons/hi";
import { BiMessageRoundedDetail } from "react-icons/bi";
import { FaCaretDown } from "react-icons/fa";
import { LuLock } from "react-icons/lu";
import { LuPlus } from "react-icons/lu";
import { Link, usePage } from "@inertiajs/react";
import { InvitationForm } from "./InvitationForm";
import { DirectChannel } from "./DirectChannel";
import { useContext } from "react";
import PageContext from "@/Contexts/PageContext";

export default function Panel() {
    const { auth } = usePage().props;
    const {
        workspace,
        channels = [],
        channel: currentChannel,
        users,
        directChannels = [],
        selfChannel,
    } = useContext(PageContext);

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
                            if (channel.type === "PUBLIC")
                                return (
                                    <li key={channel.id}>
                                        <Link
                                            href={route(
                                                "channel.show",
                                                channel.id
                                            )}
                                            only={["channel", "channelUsers"]}
                                            className={`grid-item mt-2 px-4  rounded-lg ${
                                                channel.id == currentChannel.id
                                                    ? "bg-primary"
                                                    : "hover:bg-white/10"
                                            }`}
                                        >
                                            <div className="text-lg">#</div>
                                            <div className="flex items-center">
                                                {channel.name}
                                            </div>
                                        </Link>
                                    </li>
                                );
                            else if (channel.type === "PRIVATE")
                                return (
                                    <li key={channel.id}>
                                        <Link
                                            href={`/workspace/${workspace.id}/${channel.id}`}
                                            className={`grid-item mt-2 px-4 rounded-lg ${
                                                channel.id == currentChannel.id
                                                    ? "bg-primary"
                                                    : "hover:bg-white/10"
                                            }`}
                                        >
                                            <div className="flex items-center ">
                                                <LuLock className="text-sm " />
                                            </div>
                                            <div className="font-semibold flex items-center leading-7">
                                                {channel.name}
                                            </div>
                                        </Link>
                                    </li>
                                );
                            else return "";
                        })}
                    </ul>
                    <div className="grid-item mt-2 px-4">
                        <div className="flex items-center ">
                            <LuPlus className="text-sm" />
                        </div>
                        <div className="">Add channels</div>
                    </div>
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
                            const userId = directCn.users.find(
                                (user) => user.id != auth.user.id
                            )?.id;
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
