import Tooltip from "@/Components/Tooltip";
import React from "react";
import { BiMessageRoundedDetail } from "react-icons/bi";
import { FaRegBookmark } from "react-icons/fa";
import EmojiPicker from "@emoji-mart/react";
import { Popover, PopoverButton, PopoverPanel } from "@headlessui/react";
import { CiFaceSmile } from "react-icons/ci";
import data from "@emoji-mart/data";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { setThreadMessage } from "@/Store/threadSlice";
export default function MessageToolbar({ message, threadStyle = false }) {
    const dispatch = useDispatch();
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    return (
        <div
            className={`absolute bg-background  -top-6 h-12 w-fit right-12 group-hover:flex items-center justify-between  border rounded-lg border-white/15 p-2 ${
                showEmojiPicker ? "flex" : "hidden"
            }`}
        >
            {!threadStyle && (
                <Tooltip
                    content={
                        <div className="min-w-24 p-1 text-center text-sm ">
                            Reply in thread
                        </div>
                    }
                >
                    <button
                        className="rounded p-2 hover:bg-white/15"
                        onClick={() => dispatch(setThreadMessage(message))}
                    >
                        <BiMessageRoundedDetail className="text-lg" />
                    </button>
                </Tooltip>
            )}
            <Tooltip
                content={
                    <div className="min-w-24 p-1 text-center text-sm ">
                        Save for later
                    </div>
                }
            >
                <div className="rounded p-2 hover:bg-white/15">
                    <FaRegBookmark className="text-lg" />
                </div>
            </Tooltip>
            <Tooltip
                content={
                    <div className="min-w-24 p-1 text-center text-sm ">
                        Find a reaction
                    </div>
                }
            >
                <div className="rounded p-2 hover:bg-white/15">
                    <Popover className="relative flex items-center">
                        {({ open }) => {
                            if (open !== showEmojiPicker) {
                                setShowEmojiPicker(open);
                            }
                            return (
                                <>
                                    <PopoverButton>
                                        <CiFaceSmile
                                            onClick={() =>
                                                setShowEmojiPicker(true)
                                            }
                                        />
                                    </PopoverButton>
                                    <PopoverPanel
                                        anchor="bottom"
                                        className="flex flex-col"
                                    >
                                        {({ close }) => (
                                            <EmojiPicker
                                                data={data}
                                                onEmojiSelect={(emoji) => {
                                                    console.log(emoji);
                                                    close();
                                                    setShowEmojiPicker(false);
                                                }}
                                            />
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
