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
import axios from "axios";
export default function ChatArea({
    channelName = "project",
    members = [],
    workspace,
    channel,
    messages = [],
}) {
    const { auth } = usePage().props;
    const otherUser = members.find((u) => u.id != auth.user.id);
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
        window.Echo.private(`channels.${channel.id}`).listen(
            "MessageEvent",
            (e) => {
                setlocalMessages((pre) => [...pre, e.message]);
            }
        );
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
                    <div className="flex items-center gap-x-4">
                        <div className="flex items-center p-1 border  border-white/15 rounded-lg px-2">
                            <Avatar
                                src={auth.user.avatar_url}
                                noStatus={true}
                                className="w-4 h-4"
                            />
                            <div className="text-xs ml-2">1</div>
                        </div>
                        <div className="flex items-center p-1 border border-white/15 rounded-lg px-2 gap-x-3 font-normal">
                            <div className="flex items-center gap-x-1">
                                <FiHeadphones className="text-xl" />
                                <div className="text-sm ">Huddle</div>
                            </div>
                            <div className="flex items-center gap-x-1">
                                <span className="text-sm opacity-25 ">|</span>
                                <FaAngleDown className="text-xs" />
                            </div>
                        </div>
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
                    const user = members.filter(
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
