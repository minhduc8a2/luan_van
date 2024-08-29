import Avatar from "@/Components/Avatar";
import { usePage } from "@inertiajs/react";
import React from "react";
import { FaAngleDown } from "react-icons/fa6";
import { FiHeadphones } from "react-icons/fi";
import { CgFileDocument } from "react-icons/cg";
import { FaPlus } from "react-icons/fa6";
import TipTapEditor from "@/Components/TipTapEditor";
import { router } from "@inertiajs/react";
import { useEffect, useState, useRef } from "react";
import { differenceInSeconds } from "@/helpers/dateTimeHelper";

import Message from "./Message";

import { useContext } from "react";
import PageContext from "@/Contexts/PageContext";

export default function ChatArea() {
    const {
        channelName = "project",

        channel,
        channelUsers = [],
        messages = [],
    } = useContext(PageContext);

    const { auth } = usePage().props;
    const otherUser = channelUsers.find((u) => u.id != auth.user.id);
    const messageContainerRef = useRef(null);

    const [localMessages, setlocalMessages] = useState([...messages]);
    function onSubmit(content, fileObjects) {
        if (content == "<p></p>" && fileObjects.length == 0) return;
        router.post(route("message.store", { channel: channel.id }), {
            content,
            fileObjects,
        });
    }

    let preValue = null;
    let hasChanged = false;
    useEffect(() => {
        Echo.join(`channels.${channel.id}`)
            .here((users) => {})
            .joining((user) => {})
            .leaving((user) => {})
            .listen("MessageEvent", (e) => {
                setlocalMessages((pre) => [...pre, e.message]);
                // console.log(e);
            })
            .error((error) => {
                console.error(error);
            });
    }, []);
    useEffect(() => {
        if (messageContainerRef.current)
            messageContainerRef.current.scrollTop =
                messageContainerRef.current.scrollHeight;
    }, [localMessages]);
    return (
        <div className="bg-background  chat-area-container col-span-3 ">
            <div className="p-4 border-b border-b-white/10">
                <div className="flex justify-between font-bold text-lg opacity-75">
                    <div className="flex items-center gap-x-2">
                        <div className="">
                            #{" "}
                            {channel.type == "DIRECT"
                                ? otherUser.name
                                : channelName}
                        </div>
                        <FaAngleDown className="text-sm" />
                    </div>
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
                        <Huddle />

                        <div className="p-1 border border-white/15 rounded-lg ">
                            <CgFileDocument className="text-xl" />
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-x-2 opacity-75 mt-4">
                    <FaPlus className="text-xs" />
                    <div className="text-sm">Add bookmarks</div>
                </div>
            </div>
            <div
                className="overflow-y-auto max-w-full scrollbar"
                ref={messageContainerRef}
            >
                {localMessages.map((message, index) => {
                    const user = channelUsers.filter(
                        (mem) => mem.id === message.user_id
                    )[0];
                    hasChanged = false;
                    if (preValue) {
                        if (
                            preValue.user.id != user.id ||
                            differenceInSeconds(
                                preValue.message.updated_at,
                                message.updated_at
                            ) > 10
                        ) {
                            hasChanged = true;
                            preValue = { user, message };
                        }
                    } else preValue = { user, message };
                    return (
                        <Message
                            key={message.id}
                            message={message}
                            user={user}
                            hasChanged={hasChanged}
                            index={index}
                        />
                    );
                })}
            </div>
            <div className="m-6 border border-white/50 pt-4 px-2 rounded-lg">
                <TipTapEditor onSubmit={onSubmit} />
            </div>
        </div>
    );
}

import { MdOutlineZoomOutMap } from "react-icons/md";
import { GrMicrophone } from "react-icons/gr";
import { PiVideoCameraSlash } from "react-icons/pi";
import { CgScreen } from "react-icons/cg";
import { IoMdPersonAdd } from "react-icons/io";
import { RiMore2Fill } from "react-icons/ri";
import Button from "@/Components/Button";
import IconButton from "@/Components/IconButton";
function Huddle() {
    const [show, setShow] = useState(false);
    const { sideBarWidth, channel } = useContext(PageContext);
    const { auth } = usePage().props;
    return (
        <div className=" ">
            <div
                className={`flex items-center p-1 border border-white/15 rounded-lg px-2 gap-x-3 font-normal  ${
                    show ? "bg-green-700" : ""
                }`}
            >
                <button
                    className={`flex items-center gap-x-1`}
                    onClick={() => setShow((pre) => !pre)}
                >
                    <FiHeadphones className="text-xl" />
                    <div className="text-sm ">Huddle</div>
                </button>
                {/* <div className="flex items-center gap-x-1">
                              <span className="text-sm opacity-25 ">|</span>
                              <FaAngleDown className="text-xs" />
                          </div> */}
            </div>
            {show && (
                <div
                    className="bg-primary-light w-96     fixed bottom-12 rounded-xl"
                    style={{ left: sideBarWidth + 16 }}
                >
                    <div className="flex justify-between p-4 items-center">
                        <div className="text-sm">{channel.name}</div>
                        <MdOutlineZoomOutMap />
                    </div>
                    <div className="p-4 flex justify-center gap-x-2 bg-white/10 mx-4 rounded-lg">
                        <Avatar src={auth.user.avatar_url} noStatus />
                    </div>
                    <ul className="flex gap-x-2 items-center p-4 justify-center">
                        <IconButton
                            description="Mute mic"
                            activeDescription="Unmute mic"
                        >
                            <GrMicrophone />
                        </IconButton>
                        <IconButton
                            description="Turn on video"
                            activeDescription="Turn off video"
                        >
                            <PiVideoCameraSlash />
                        </IconButton>
                        <IconButton
                            description="Share screen"
                            activeDescription="Stop sharing"
                        >
                            <CgScreen />
                        </IconButton>
                        <IconButton
                            description="Invite people"
                            activable={false}
                        >
                            <IoMdPersonAdd />
                        </IconButton>
                        <IconButton
                            description="More options"
                            activable={false}
                        >
                            <RiMore2Fill />
                        </IconButton>
                        <li>
                            <Button className="bg-pink-600 text-sm">
                                Leave
                            </Button>
                        </li>
                    </ul>
                </div>
            )}
        </div>
    );
}
