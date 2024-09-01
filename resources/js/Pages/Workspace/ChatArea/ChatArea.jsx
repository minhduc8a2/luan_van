import Avatar from "@/Components/Avatar";

import React, { useContext } from "react";
import { FaAngleDown } from "react-icons/fa6";
import { FiHeadphones } from "react-icons/fi";
import { CgFileDocument } from "react-icons/cg";
import { FaPlus } from "react-icons/fa6";
import TipTapEditor from "@/Components/TipTapEditor";
import { router, usePage } from "@inertiajs/react";
import { useEffect, useRef, useState } from "react";
import { differenceInSeconds } from "@/helpers/dateTimeHelper";

import Message from "./Message/Message";

import { toggleHuddle } from "@/Store/huddleSlice";

import { useSelector, useDispatch } from "react-redux";

export default function ChatArea() {
    const {
        auth,
        channel,
        channelUsers,
        messages: initMessages,
    } = usePage().props;
    const dispatch = useDispatch();
    const { channel: huddleChannel } = useSelector((state) => state.huddle);

    const { show } = useSelector((state) => state.huddle);
    const messageContainerRef = useRef(null);
    const [messages, setMessages] = useState(initMessages);
    function onSubmit(content, fileObjects) {
        console.log("submit on channel: ", channel);
        if (content == "<p></p>" && fileObjects.length == 0) return;
        router.post(route("message.store", { channel: channel.id }), {
            content,
            fileObjects,
        });
    }

    let preValue = null;
    let hasChanged = false;
    useEffect(() => {
        setMessages(initMessages);
    }, [initMessages]);
    useEffect(() => {
        console.log("Channel: ", channel.name);
        Echo.join(`channels.${channel.id}`)
            .here((users) => {})
            .joining((user) => {
                console.log("join", user, channel.name);
            })
            .leaving((user) => {
                console.log("leaving", user);
            })
            .listen("MessageEvent", (e) => {
                setMessages((pre) => [...pre, e.message]);
                // console.log(e);
            })
            .error((error) => {
                console.error(error);
            });
        return () => {
            Echo.leave(`channels.${channel.id}`);
        };
    }, [channel]);
    useEffect(() => {
        if (messageContainerRef.current)
            messageContainerRef.current.scrollTop =
                messageContainerRef.current.scrollHeight;
    }, [messages]);

    return (
        <div className="bg-background  chat-area-container col-span-3 ">
            <div className="p-4 border-b border-b-white/10">
                <div className="flex justify-between font-bold text-lg opacity-75">
                    <div className="flex items-center gap-x-2">
                        <div className=""># {channel.name}</div>
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
                        <div
                            className={`flex items-center p-1 border border-white/15 rounded-lg px-2 gap-x-3 font-normal  ${
                                show ? "bg-green-700" : ""
                            }`}
                        >
                            <button
                                className={`flex items-center gap-x-1`}
                                onClick={() => {
                                    if (huddleChannel) {
                                        if (
                                            confirm(
                                                "Are you sure you want to switch to other huddle"
                                            )
                                        )
                                            dispatch(
                                                toggleHuddle({
                                                    channel,
                                                    user: auth.user,
                                                })
                                            );
                                    } else {
                                        dispatch(
                                            toggleHuddle({
                                                channel,
                                                user: auth.user,
                                            })
                                        );
                                    }
                                }}
                            >
                                <FiHeadphones className="text-xl" />
                                <div className="text-sm ">Huddle</div>
                            </button>
                            {/* <div className="flex items-center gap-x-1">
                              <span className="text-sm opacity-25 ">|</span>
                              <FaAngleDown className="text-xs" />
                          </div> */}
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
                {messages.map((message, index) => {
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
                <TipTapEditor onSubmit={(a, b) => onSubmit(a, b)} />
            </div>
        </div>
    );
}
