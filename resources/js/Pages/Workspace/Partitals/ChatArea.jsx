import Avatar from "@/Components/Avatar";
import { usePage } from "@inertiajs/react";
import React from "react";
import { FaAngleDown } from "react-icons/fa6";
import { FiHeadphones } from "react-icons/fi";
import { CgFileDocument } from "react-icons/cg";
import { FaPlus } from "react-icons/fa6";
export default function ChatArea({ channelName = "project", members = [] }) {
    const { auth } = usePage().props;
    return (
        <div className="bg-background h-full chat-area-container ">
            <div className="p-4 border-b border-b-white/10">
                <div className="flex justify-between font-bold text-lg opacity-75">
                    <div className="flex items-center gap-x-2">
                        <div className=""># {channelName}</div>
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
            <div>content</div>
            <div className="h-32">chat input</div>
        </div>
    );
}
