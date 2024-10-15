import React from "react";
import Tooltip from "@/Components/Tooltip";
import { LuSmilePlus } from "react-icons/lu";
import { Popover, PopoverButton, PopoverPanel } from "@headlessui/react";
import EmojiPicker from "@emoji-mart/react";
import data from "@emoji-mart/data";
import { useState } from "react";
import { usePage } from "@inertiajs/react";
import { useChannelData } from "@/helpers/customHooks";
export default function Reactions({
    groupedReactions,
    reactToMessage,
    removeMessageReaction,
}) {
    const { channelId } = usePage().props;
    const { permissions } = useChannelData(channelId);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    if (groupedReactions.length == 0) return "";
    return (
        <div className="flex gap-2 mt-4 items-center flex-wrap">
            {groupedReactions.map((reaction) => (
                <Tooltip
                    key={reaction.emoji_id}
                    content={
                        <ul className="whitespace-nowrap p-1 text-color-medium-emphasis">
                            {reaction.users.map((user) => (
                                <li key={user.id} className="text-xs">
                                    {user.display_name || user.name}
                                </li>
                            ))}
                        </ul>
                    }
                >
                    <button
                        onClick={() => {
                            if (
                                reaction.hasReacted &&
                                permissions.deleteReaction
                            ) {
                                removeMessageReaction(reaction.emoji_id);
                            } else if (
                                !reaction.hasReacted &&
                                permissions.createReaction
                            ) {
                                reactToMessage(reaction.emoji_id);
                            }
                        }}
                        className={`${
                            reaction.hasReacted
                                ? "bg-blue-500/25"
                                : "bg-color/15"
                        } rounded-full px-[6px] flex items-center gap-x-1 py-[2px] ${
                            permissions.deleteReaction ? "" : "cursor-default"
                        }`}
                    >
                        <div className="text-sm">{reaction.nativeEmoji}</div>
                        <div className="text-sm w-2 font-semibold text-color-medium-emphasis">
                            {reaction.users.length}
                        </div>
                    </button>
                </Tooltip>
            ))}
            {groupedReactions.length > 0 && permissions.createReaction && (
                <div className="bg-white/15 rounded-full px-[8px] flex items-center gap-x-1 py-[4px]">
                    <Tooltip
                        content={
                            <div className="whitespace-nowrap p-1 text-center text-sm ">
                                Find a reaction
                            </div>
                        }
                    >
                        <div className="">
                            <Popover className="relative flex items-center">
                                {({ open }) => {
                                    if (open !== showEmojiPicker) {
                                        setShowEmojiPicker(open);
                                    }
                                    return (
                                        <>
                                            <PopoverButton>
                                                <LuSmilePlus
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
            )}
        </div>
    );
}
