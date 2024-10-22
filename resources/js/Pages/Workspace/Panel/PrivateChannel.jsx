import ThemeContext from "@/ThemeProvider";
import React, { useContext, useTransition } from "react";
import { FiArchive } from "react-icons/fi";
import { LuLock } from "react-icons/lu";
import { useParams } from "react-router-dom";

export default function PrivateChannel({ channel, changeChannel }) {
    const { channelId } = useParams();
    const { theme } = useContext(ThemeContext);
    const [isPending, startTransition] = useTransition();
    function onClick() {
        startTransition(() => {
            changeChannel(channel);
        });
    }
    return (
        <button
            onClick={onClick}
            className={`flex items-center mt-2 w-full px-4 justify-between rounded-lg ${
                isPending ? "animate-pulse" : ""
            }  ${
                channel.id == channelId
                    ? theme.mode
                        ? "bg-primary-300"
                        : "bg-primary-600"
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
                {channel.unread_messages_count
                    ? channel.unread_messages_count
                    : ""}
            </div>
        </button>
    );
}
