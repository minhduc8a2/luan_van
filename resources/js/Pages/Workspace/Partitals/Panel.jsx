import React from "react";
import { IoIosArrowDown } from "react-icons/io";
import { HiOutlinePencilAlt } from "react-icons/hi";
import { BiMessageRoundedDetail } from "react-icons/bi";
import { FaCaretDown } from "react-icons/fa";
import { LuLock } from "react-icons/lu";
import { LuPlus } from "react-icons/lu";
import Avatar from "@/Components/Avatar";
import { Link, usePage } from "@inertiajs/react";
import FormFrameWork from "@/Components/FormFrameWork";
import TextInput from "@/Components/TextInput";
import TextArea from "@/Components/TextArea";
import Button from "@/Components/Button";
import { FaLink } from "react-icons/fa6";
import Form1 from "@/Components/Form1";
export default function Panel({
    workspace,
    channels = [],
    currentChannel,
    users,
}) {
    const { auth } = usePage().props;
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
                        {users.map((user) => (
                            <li
                                key={user.id}
                                className="flex mt-2 items-center justify-start gap-x-2 px-4 "
                            >
                                <div className="">
                                    <Avatar
                                        src={user.avatar_url}
                                        className="w-5 h-5"
                                        onlineClassName="scale-75"
                                        offlineClassName="scale-75"
                                        isOnline={true}
                                    />
                                </div>
                                <div className="">
                                    {user.name}{" "}
                                    {user.id == auth.user.id ? (
                                        <span className="opacity-75 ml-2">
                                            you
                                        </span>
                                    ) : (
                                        ""
                                    )}
                                </div>
                            </li>
                        ))}
                    </ul>
                    <InviteForm workspace={workspace} />
                </div>
            </div>
        </div>
    );
}
function InviteForm({ workspace }) {
    return (
        <Form1
            buttonName="Send"
            activateButtonNode={
                <div className="grid-item mt-2 px-4 w-fit">
                    <div className="flex items-center ">
                        <LuPlus className="text-sm" />
                    </div>
                    <div className="">Add coworkers</div>
                </div>
            }
            title={`Invite people to ${workspace.name}`}
            sameButtonRow={
                <div className="flex gap-x-2 items-center text-link font-bold">
                    <FaLink className="text-lg" /> Copy invite link
                </div>
            }
        >
            {" "}
            <TextArea
                id="name"
                rows="2"
                label="To:"
                placeholder="name@gmail.com"
            />
        </Form1>
    );
}
