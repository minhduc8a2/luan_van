import { setThreadMessage } from "@/Store/threadSlice";
import React, { useMemo } from "react";
import { IoClose } from "react-icons/io5";
import { useDispatch, useSelector } from "react-redux";
import Message from "./Message/Message";
import { router, usePage } from "@inertiajs/react";
import { useEffect, useState, useRef } from "react";
import TipTapEditor from "@/Components/TipTapEditor";
import OverlayLoadingSpinner from "@/Components/Overlay/OverlayLoadingSpinner";
import { compareDateTime, differenceInSeconds } from "@/helpers/dateTimeHelper";
export default function Thread() {
    const dispatch = useDispatch();
    const { channel } = usePage().props;
    const { message } = useSelector((state) => state.thread);
    const { channelUsers } = usePage().props;
    const [messages, setMessages] = useState([]);
    const nextPageUrlRef = useRef(null);
    const messageContainerRef = useRef(null);
    const user = channelUsers.filter((mem) => mem.id === message.user_id)[0];
    const [loadingMessages, setLoadingMessages] = useState(false);
    const [infiniteScroll, setInfiniteScroll] = useState(false);
    let preValue = null;
    let hasChanged = false;
    useEffect(() => {
        Echo.join(`threads.${message.id}`)
            .here((users) => {})
            .joining((user) => {
                console.log("join thread", user);
            })
            .leaving((user) => {
                console.log("leaving thread", user);
            })
            .listen("ThreadMessageEvent", (e) => {
                setMessages((pre) => [...pre, e.message]);
                console.log(e);
            })
            .error((error) => {
                console.error(error);
            });

        setLoadingMessages(true);
        axios
            .get(
                route("thread.messages", {
                    channel: channel.id,
                    message: message.id,
                })
            )
            .then((response) => {
                nextPageUrlRef.current = response.data?.messages?.next_page_url;
                setMessages(response.data?.messages?.data || []);
                setLoadingMessages(false);
            });
        return () => {
            setMessages([]);
            Echo.leave(`threads.${message.id}`);
        };
    }, [message.id]);
    useEffect(() => {
        if (messageContainerRef.current)
            if (!infiniteScroll) {
                messageContainerRef.current.scrollTop =
                    messageContainerRef.current.scrollHeight;
            } else {
                setInfiniteScroll(false);
                const newScrollHeight =
                    messageContainerRef.current.scrollHeight;
                messageContainerRef.current.scrollTop =
                    newScrollHeight -
                    prevScrollHeightRef.current +
                    messageContainerRef.current.scrollTop;
            }
    }, [messages]);
    const sortedMessages = useMemo(() => {
        const temp = [...messages];
        temp.sort((a, b) => compareDateTime(a.created_at, b.created_at));
        return temp;
    }, [messages]);
    function onSubmit(content, fileObjects) {
        if (content == "<p></p>" && fileObjects.length == 0) return;
        router.post(
            route("thread_message.store", {
                channel: channel.id,
                message: message.id,
            }),
            {
                content,
                fileObjects,
            },
            {
                preserveState: true,
                preserveScroll: true,
            }
        );
    }
    return (
        <div className="w-[35%] bg-background flex flex-col">
            <div className="p-4 z-10">
                <div className="flex justify-between font-bold text-lg opacity-75 items-center">
                    <div className="">Thread</div>
                    <button
                        onClick={() => dispatch(setThreadMessage(null))}
                        className="hover:bg-white/15 rounded-lg p-2"
                    >
                        <IoClose className="text-xl" />
                    </button>
                </div>
            </div>

            <div className="max-h-[30%] overflow-y-auto scrollbar">
                <Message
                    threadStyle={true}
                    message={message}
                    user={user}
                    hasChanged={true}
                    index={0}
                />
            </div>

            <div className="flex items-center gap-x-4 my-4">
                <h3 className="text-sm text-white/75">
                    {messages.length}{" "}
                    {messages.length > 1 ? "replies" : "reply"}
                </h3>{" "}
                <hr className="border-white/15 flex-1" />
            </div>
            {loadingMessages && (
                <div className="flex justify-center items-center">
                    <div className="h-12 w-12 relative">
                        <OverlayLoadingSpinner spinerStyle="border-link" />
                    </div>
                    Loading messages ...
                </div>
            )}
            <div
                className="overflow-y-auto max-w-full flex-1 scrollbar"
                ref={messageContainerRef}
            >
                <ul className="">
                    {sortedMessages.map((message, index) => {
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
                                threadStyle={true}
                            />
                        );
                    })}
                </ul>
            </div>
            <div className="m-6 border border-white/15 pt-4 px-2 rounded-lg">
                <TipTapEditor
                    onSubmit={(a, b) => onSubmit(a, b)}
                    message={message}
                />
            </div>
        </div>
    );
}
