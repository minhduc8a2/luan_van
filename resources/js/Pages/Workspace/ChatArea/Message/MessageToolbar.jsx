import Tooltip from "@/Components/Tooltip";
import React from "react";
import { BiMessageRoundedDetail } from "react-icons/bi";
import { FaRegBookmark } from "react-icons/fa";
import EmojiPicker from "@emoji-mart/react";
import { Popover, PopoverButton, PopoverPanel } from "@headlessui/react";
import { LuSmilePlus } from "react-icons/lu";

import data from "@emoji-mart/data";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { setThreadedMessageId } from "@/Store/threadSlice";
import { IoMdMore } from "react-icons/io";
import { usePage } from "@inertiajs/react";
import DeleteMessage from "./DeleteMessage";
import { PiShareFat } from "react-icons/pi";
import { useChannelData } from "@/helpers/customHooks";
export default function MessageToolbar({
    message,
    threadStyle = false,
    reactToMessage,
    setIsHovered,
    setIsEditing,
    user,
    forwardFn,
}) {
    const dispatch = useDispatch();
    const { auth, channelId } = usePage().props;
    const { permissions } = useChannelData(channelId);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [showMore, setShowMore] = useState(false);

    return (
        <div
            className={`absolute bg-foreground  -top-6 h-12 w-fit right-12 group-hover:flex items-center justify-between  border rounded-lg border-color/15 p-2 ${
                showEmojiPicker || showMore ? "flex" : "hidden"
            }`}
        >
            <Tooltip
                content={
                    <div className="text-color-high-emphasis whitespace-nowrap p-1 text-center text-sm ">
                        Completed
                    </div>
                }
            >
                <button
                    className="rounded p-2 hover:bg-color/15"
                    onClick={() => reactToMessage("white_check_mark")}
                >
                    ✅
                </button>
            </Tooltip>
            <Tooltip
                content={
                    <div className="text-color-high-emphasis whitespace-nowrap p-1 text-center text-sm ">
                        Take a look
                    </div>
                }
            >
                <button
                    className="rounded p-2 hover:bg-color/15"
                    onClick={() => reactToMessage("eyes")}
                >
                    👀
                </button>
            </Tooltip>
            <Tooltip
                content={
                    <div className="text-color-high-emphasis whitespace-nowrap p-1 text-center text-sm ">
                        Nicely done
                    </div>
                }
            >
                <button
                    className="rounded p-2 hover:bg-color/15"
                    onClick={() => reactToMessage("open_hands")}
                >
                    🤲
                </button>
            </Tooltip>
            {!threadStyle && !message.is_auto_generated && (
                <Tooltip
                    content={
                        <div className="text-color-high-emphasis whitespace-nowrap p-1 text-center text-sm ">
                            Reply in thread
                        </div>
                    }
                >
                    <button
                        className="rounded p-2 hover:bg-color/15"
                        onClick={() =>
                            dispatch(setThreadedMessageId(message.id))
                        }
                    >
                        <BiMessageRoundedDetail className="text-lg text-color/85" />
                    </button>
                </Tooltip>
            )}
            <Tooltip
                content={
                    <div className="text-color-high-emphasis whitespace-nowrap p-1 text-center text-sm ">
                        Save for later
                    </div>
                }
            >
                <div className="rounded p-2 hover:bg-color/15">
                    <FaRegBookmark className="text-lg text-color/85" />
                </div>
            </Tooltip>
            <Tooltip
                content={
                    <div className="text-color-high-emphasis whitespace-nowrap p-1 text-center text-sm ">
                        Share message
                    </div>
                }
            >
                <button
                    className="rounded p-2 hover:bg-color/15"
                    onClick={forwardFn}
                >
                    <PiShareFat className="text-lg text-color/85" />
                </button>
            </Tooltip>
            <Tooltip
                content={
                    <div className="text-color-high-emphasis whitespace-nowrap p-1 text-center text-sm ">
                        Find a reaction
                    </div>
                }
            >
                <div className="rounded p-2 hover:bg-color/15">
                    <Popover className="relative flex items-center">
                        {({ open }) => {
                            return (
                                <>
                                    <PopoverButton>
                                        <LuSmilePlus
                                            className="text-color/85"
                                            onClick={() => {
                                                setIsHovered(true);
                                                setShowEmojiPicker(true);
                                            }}
                                        />
                                    </PopoverButton>
                                    <PopoverPanel
                                        anchor="bottom"
                                        className="flex flex-col"
                                    >
                                        {({ close }) => (
                                            <div className="">
                                                <div
                                                    className="fixed top-0 bottom-0 right-0 left-0 bg-transparent overflow-hidden z-10"
                                                    onClick={() => {
                                                        close();
                                                        setShowEmojiPicker(
                                                            false
                                                        );
                                                        setIsHovered(false);
                                                    }}
                                                ></div>
                                                <div className="z-20 relative">
                                                    <EmojiPicker
                                                        data={data}
                                                        onEmojiSelect={(
                                                            emoji
                                                        ) => {
                                                            close();
                                                            setShowEmojiPicker(
                                                                false
                                                            );
                                                            reactToMessage(
                                                                emoji.id
                                                            );
                                                            setIsHovered(false);
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        )}
                                    </PopoverPanel>
                                </>
                            );
                        }}
                    </Popover>
                </div>
            </Tooltip>
            {/* More */}
            <Tooltip
                content={
                    <div className="text-color-high-emphasis whitespace-nowrap p-1 text-center text-sm ">
                        More actions
                    </div>
                }
            >
                <div className="rounded p-2 hover:bg-color/15">
                    <Popover className="relative flex items-center">
                        {({ open }) => {
                            if (open !== showMore) {
                                setShowMore(open);
                            }
                            return (
                                <>
                                    <PopoverButton>
                                        <IoMdMore
                                            className="text-color-medium-emphasis"
                                            onClick={() => {
                                                setShowMore(true);
                                                setIsHovered(true);
                                            }}
                                        />
                                    </PopoverButton>
                                    <PopoverPanel
                                        anchor="bottom end"
                                        className="flex flex-col"
                                    >
                                        {({ close }) => (
                                            <div className="">
                                                <div className=" rounded-lg border border-color/15 mt-2  bg-foreground w-48 z-20 relative overflow-hidden text-sm">
                                                    <button className="hover:bg-blue-500 hover:text-color px-4  py-2 w-full text-left text-color-medium-emphasis">
                                                        Pin to channel
                                                    </button>

                                                    {message.user_id ==
                                                        auth.user.id && (
                                                        <>
                                                            <hr />
                                                            {!message.is_auto_generated && (
                                                                <button
                                                                    className="hover:bg-blue-500 hover:text-color px-4  py-2 w-full text-left text-color-medium-emphasis"
                                                                    onClick={() => {
                                                                        setIsEditing(
                                                                            true
                                                                        );
                                                                        setIsHovered(
                                                                            false
                                                                        );
                                                                        close();
                                                                    }}
                                                                >
                                                                    Edit message
                                                                </button>
                                                            )}
                                                        </>
                                                    )}
                                                    {(permissions.deleteAnyMessage ||
                                                        message.user_id ==
                                                            auth.user.id) && (
                                                        <>
                                                            <hr />
                                                            <DeleteMessage
                                                                message={
                                                                    message
                                                                }
                                                                user={user}
                                                            />
                                                        </>
                                                    )}
                                                </div>
                                                <div
                                                    className="fixed top-0 bottom-0 right-0 left-0 bg-transparent overflow-hidden z-10"
                                                    onClick={() => {
                                                        close();

                                                        setIsHovered(false);
                                                    }}
                                                ></div>
                                            </div>
                                        )}
                                    </PopoverPanel>
                                </>
                            );
                        }}
                    </Popover>
                </div>
            </Tooltip>
        </div>
    );
}
